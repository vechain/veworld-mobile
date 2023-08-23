import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LEDGER_ERROR_CODES, VETLedgerAccount } from "~Constants"

import { debug, error, warn } from "~Utils/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerUtils } from "~Utils"
import { useLedgerSubscription } from "~Hooks"
import { Mutex } from "async-mutex"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"
// import { listen } from "@ledgerhq/logs"

/**
 * useLedger is a custom react hook for interacting with ledger devices
 *
 * Since ledger security depends on user clicks, it will only attempt to
 * connect (& get the root account) when the component is rendered. (As done so by the user)
 *
 * A function is provided to manually make another attempt.
 * Eg. when the user has "Confirmed" the app is open, we can try again
 *
 * This will allow us to detect if the user has disconnected or exited the VET app before making subsequent requests
 *
 * @param onDisconnect (optional) - a callback that is invoked when a "disconnect" is detected
 *
 * @returns {@link UseLedgerProps}
 * - "removeLedger" must be invoked after the ledger action is finished
 */
export const useLedger = ({
    deviceId,
    autoConnect = true,
    maxRetries = 5,
}: {
    deviceId: string
    autoConnect?: boolean
    maxRetries?: number
}): UseLedgerProps => {
    // useEffect(() => {
    //     listen(log => {
    //         debug("ledger:log", log)
    //     })
    // }, [])

    const mutex = useRef<Mutex>(new Mutex())

    const { canConnect, unsubscribe } = useLedgerSubscription({ deviceId })
    const transport = useRef<BleTransport | undefined>()

    const [appOpen, setAppOpen] = useState<boolean>(false)
    const [appConfig, setAppConfig] = useState<LedgerConfig>(
        LedgerConfig.UNKNOWN,
    )
    const [removed, setRemoved] = useState<boolean>(false)
    const [disconnected, setDisconnected] = useState<boolean>(false)
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [autoConnectAttempted, setAutoConnectAttempted] =
        useState<boolean>(false)
    const [errorCode, setErrorCode] = useState<LEDGER_ERROR_CODES | undefined>(
        undefined,
    )

    const removeLedger = useCallback(async () => {
        let alreadyRemoved = false

        setRemoved(prev => {
            alreadyRemoved = prev
            return true
        })

        if (!alreadyRemoved) {
            debug("[Ledger] - removeLedger")

            unsubscribe()

            setRemoved(true)
            if (transport.current) {
                try {
                    await BleTransport.disconnect(deviceId)
                } catch (e) {
                    error("ledger:close", e)
                }
            }

            setRootAccount(undefined)
            setErrorCode(undefined)
            transport.current = undefined
        }
    }, [unsubscribe, deviceId])

    /**
     * @param bleTransport - the transport to use
     * @returns a function to use the transport.
     * This will acquire a mutex before invoking the function, ensuring only 1 function is invoked at a time
     */
    const withTransport = useCallback(
        (bleTransport: BleTransport) =>
            async <T>(func: (t: BleTransport) => Promise<T>) => {
                const release = await mutex.current.acquire()
                try {
                    return await func(bleTransport)
                } finally {
                    release()
                }
            },
        [mutex],
    )

    const setConfig = useCallback((config: LedgerConfig) => {
        setAppConfig(config)
        switch (config) {
            case LedgerConfig.CLAUSE_AND_CONTRACT_DISABLED:
                setErrorCode(LEDGER_ERROR_CODES.CONTRACT_AND_CLAUSES_DISABLED)
                break
            case LedgerConfig.CLAUSE_ONLY_ENABLED:
                setErrorCode(LEDGER_ERROR_CODES.CONTRACT_DISABLED)
                break
            case LedgerConfig.CONTRACT_ONLY_ENABLED:
                setErrorCode(LEDGER_ERROR_CODES.CLAUSES_DISABLED)
        }
    }, [])

    const onConnectionConfirmed = useCallback(async () => {
        debug("[Ledger] - onConnectionConfirmed")
        if (transport.current) {
            const { payload, success } = await LedgerUtils.verifyTransport(
                withTransport(transport.current),
            )

            debug("[Ledger] - verifyTransport", { payload, success })

            if (success) {
                setAppOpen(true)
                setRootAccount(payload.rootAccount)
                setConfig(payload.appConfig)
                setErrorCode(undefined)
            } else {
                await setErrorCode(payload as LEDGER_ERROR_CODES)
            }
        }
    }, [setConfig, withTransport])

    const openBleConnection = useCallback(async () => {
        debug("[Ledger] - openBleConnection")

        transport.current = await BleTransport.open(deviceId)
            .then(t => {
                debug("[Ledger] - openBleConnection - transport", t)
                return t
            })
            .catch(e => {
                error("[Ledger] - openBleConnection", e)
                throw e
            })

        debug("[Ledger] - connection successful")

        transport.current.on("disconnect", () => {
            warn("[Ledger] - on disconnect")
            setDisconnected(true)
            setRootAccount(undefined)
            setAppOpen(false)
            transport.current = undefined
        })

        await onConnectionConfirmed()
    }, [onConnectionConfirmed, deviceId])

    const attemptAutoConnect = useCallback(async () => {
        debug("[Ledger] - attemptAutoConnect")
        setIsConnecting(true)
        for (let i = 0; i < maxRetries; i++) {
            try {
                debug("[Ledger] - Attempting to open connection", i)
                await openBleConnection()
                debug("[Ledger] - Opened connection", i)
                break
            } catch (e) {
                warn("[Ledger] - Error opening connection", e)
                setErrorCode(LEDGER_ERROR_CODES.UNKNOWN)
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
        debug("[Ledger] - Finished attempting to open connection")
        setIsConnecting(false)
    }, [openBleConnection, maxRetries])

    useEffect(() => {
        if (autoConnect && canConnect && !autoConnectAttempted) {
            debug("[Ledger] - Attempting to auto connect")
            setAutoConnectAttempted(true)
            attemptAutoConnect().catch(e =>
                warn("[Ledger] - Auto connect error:", e),
            )
        }
    }, [autoConnect, canConnect, attemptAutoConnect, autoConnectAttempted])

    const openBleConnectionSafe = useCallback(async () => {
        debug("[Ledger] - openBleConnectionSafe")
        setIsConnecting(true)
        try {
            await openBleConnection()
        } catch (e) {
            setErrorCode(LEDGER_ERROR_CODES.UNKNOWN)
        }
        setIsConnecting(false)
    }, [openBleConnection])

    useEffect(() => {
        if (!removed && disconnected) {
            openBleConnection().finally(() => setDisconnected(false))
        }
    }, [removed, disconnected, openBleConnection])

    const externalWithTransport = useMemo(() => {
        if (!transport.current || !appOpen) return undefined
        return withTransport(transport.current)
    }, [appOpen, withTransport])

    useEffect(() => {
        debug({
            rootAccount,
            errorCode,
            isConnecting,
            transport: !!transport.current,
            appConfig,
        })
    }, [rootAccount, errorCode, isConnecting, appConfig])

    return {
        appOpen,
        appConfig,
        rootAccount,
        isConnecting,
        errorCode: isConnecting ? undefined : errorCode,
        removeLedger,
        withTransport: externalWithTransport,
        tryLedgerConnection: openBleConnectionSafe,
        tryLedgerVerification: onConnectionConfirmed,
    }
}

/**
 * @field vetApp - a {@link VET} instance that can be used to make requests to the ledger
 * @field rootAccount - The root VET account on the ledger (with chaincode). This can be used to derive further accounts
 * @field errorCode - the last error code that was encountered when attempting to connect to the ledger
 * @field openOrFinalizeConnection - a function that can be used to manually attempt to connect to the ledger - does not recreate transport if already exists
 * openBleConnection - a function that can be used to manually attempt to connect to the ledger - recreate transport if already exists
 * @field isConnecting - a boolean that indicates if the ledger is currently attempting to connect
 * @field setTimerEnabled - a function that can be used to enable/disable the timer that attempts to connect to the ledger
 * @field transport - the current transport that is being used to connect to the ledger
 */
interface UseLedgerProps {
    appOpen: boolean
    appConfig: LedgerConfig
    rootAccount?: VETLedgerAccount
    errorCode: LEDGER_ERROR_CODES | undefined
    tryLedgerConnection: () => Promise<void>
    tryLedgerVerification: () => Promise<void>
    isConnecting: boolean
    removeLedger: () => Promise<void>
    withTransport?: <T>(func: (t: BleTransport) => Promise<T>) => Promise<T>
}
