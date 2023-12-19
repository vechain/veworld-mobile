import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ERROR_EVENTS, LEDGER_ERROR_CODES, VETLedgerAccount } from "~Constants"

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
}: {
    deviceId: string
    autoConnect?: boolean
}): UseLedgerProps => {
    const mutex = useRef<Mutex>(new Mutex())

    const { canConnect, unsubscribe, timedOut, setCanConnect } = useLedgerSubscription({
        deviceId,
        timeout: 5000,
    })

    const transport = useRef<BleTransport | undefined>()
    const [appOpen, setAppOpen] = useState<boolean>(false)
    const [appConfig, setAppConfig] = useState<LedgerConfig>(LedgerConfig.UNKNOWN)
    const [removed, setRemoved] = useState<boolean>(false)
    const [disconnected, setDisconnected] = useState<boolean>(false)
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [errorCode, setErrorCode] = useState<LEDGER_ERROR_CODES | undefined>(undefined)

    useEffect(() => {
        if (timedOut) {
            setErrorCode(LEDGER_ERROR_CODES.DEVICE_NOT_FOUND)
        }
    }, [timedOut])

    const removeLedger = useCallback(async () => {
        if (!removed) {
            debug(ERROR_EVENTS.LEDGER, "removeLedger")

            setRemoved(true)
            unsubscribe()
            if (transport.current) {
                try {
                    await BleTransport.disconnectDevice(deviceId)
                } catch (e) {
                    error(ERROR_EVENTS.LEDGER, e)
                }
            }

            setRootAccount(undefined)
            setErrorCode(undefined)
            transport.current = undefined
        }
    }, [removed, unsubscribe, deviceId])

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
                break
            default:
                setErrorCode(undefined)
        }
    }, [])

    const onConnectionConfirmed = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "onConnectionConfirmed")
        if (transport.current) {
            const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

            debug(ERROR_EVENTS.LEDGER, "verifyTransport", res)

            if (res.success) {
                setAppOpen(true)
                setRootAccount(res.payload.rootAccount)
                setConfig(res.payload.appConfig.toString().slice(0, 2) as LedgerConfig)
            } else {
                await setErrorCode(res.err as LEDGER_ERROR_CODES)
            }
        }
    }, [setConfig, withTransport])

    const openBleConnection = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "openBleConnection")

        transport.current = await BleTransport.open(deviceId).catch(e => {
            error(ERROR_EVENTS.LEDGER, "openBleConnection", e)
            throw e
        })

        debug(ERROR_EVENTS.LEDGER, "connection successful")

        transport.current.on("disconnect", () => {
            warn(ERROR_EVENTS.LEDGER, "on disconnect")
            setDisconnected(true)
            setRootAccount(undefined)
            setAppOpen(false)
            setCanConnect(false)
            setErrorCode(LEDGER_ERROR_CODES.DISCONNECTED)
            transport.current = undefined
        })

        await onConnectionConfirmed()
    }, [setCanConnect, onConnectionConfirmed, deviceId])

    const attemptBleConnection = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "attemptAutoConnect")
        setIsConnecting(true)

        try {
            debug(ERROR_EVENTS.LEDGER, "Attempting to open connection")
            await openBleConnection()
            debug(ERROR_EVENTS.LEDGER, "Opened connection")
        } catch (e) {
            warn(ERROR_EVENTS.LEDGER, "Error opening connection", e)
            setErrorCode(LEDGER_ERROR_CODES.UNKNOWN)
        }

        debug(ERROR_EVENTS.LEDGER, "Finished attempting to open connection")
        setIsConnecting(false)
    }, [openBleConnection])

    useEffect(() => {
        if (autoConnect && canConnect) {
            debug(ERROR_EVENTS.LEDGER, "Attempting to auto connect")
            attemptBleConnection().catch(e => warn(ERROR_EVENTS.LEDGER, "Auto connect error:", e))
        }
    }, [autoConnect, canConnect, attemptBleConnection])

    useEffect(() => {
        if (!removed && disconnected) {
            openBleConnection().finally(() => setDisconnected(false))
        }
    }, [removed, disconnected, openBleConnection])

    const externalWithTransport = useMemo(() => {
        if (!transport.current || !appOpen) return undefined
        return withTransport(transport.current)
    }, [appOpen, withTransport])

    return {
        appOpen,
        appConfig,
        rootAccount,
        isConnecting,
        errorCode,
        removeLedger,
        withTransport: externalWithTransport,
        tryLedgerConnection: attemptBleConnection,
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
