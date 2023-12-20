import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LEDGER_ERROR_CODES, VETLedgerAccount } from "~Constants"

import { debug, error, warn } from "~Utils/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerUtils } from "~Utils"
import { useLedgerSubscription } from "~Hooks"
import { Mutex } from "async-mutex"
import { LedgerConfig, VerifyTransportResponse } from "~Utils/LedgerUtils/LedgerUtils"
import { Success } from "~Model"
// import { listen } from "@ledgerhq/logs"

let pollingInterval: NodeJS.Timeout | undefined
const CHECK_LEDGER_STATUS_INTERVAL = 4000

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
    // useEffect(() => {
    //     listen(log => {
    //         debug("ledger:log", log)
    //     })
    // }, [])

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
            debug("[Ledger] - removeLedger")

            setRemoved(true)
            unsubscribe()
            if (transport.current) {
                try {
                    await BleTransport.disconnectDevice(deviceId)
                } catch (e) {
                    error("ledger:close", e)
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

    const stopPollingDeviceStatus = useCallback(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval)
            pollingInterval = undefined
        }
    }, [])

    // when the device is available
    const onDeviceAvailable = useCallback(
        (res: Success<VerifyTransportResponse>) => {
            setAppOpen(true)
            setRootAccount(res.payload.rootAccount)
            setConfig(res.payload.appConfig.toString().slice(0, 2) as LedgerConfig)
            stopPollingDeviceStatus()
        },
        [setConfig, stopPollingDeviceStatus],
    )

    const checkLedgerStatus = useCallback(async () => {
        if (transport.current) {
            debug("[Ledger] - checkLedgerStatus")
            const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

            if (res.success) {
                onDeviceAvailable(res)
            } else {
                debug("[Ledger] - checkLedgerStatus - error", res)
                await setErrorCode(res.err as LEDGER_ERROR_CODES)
            }
        }
    }, [withTransport, onDeviceAvailable])

    const pollingLedgerStatus = useCallback(async () => {
        if (pollingInterval) {
            return
        }
        checkLedgerStatus()
        pollingInterval = setInterval(checkLedgerStatus, CHECK_LEDGER_STATUS_INTERVAL)
    }, [checkLedgerStatus])

    const openBleConnection = useCallback(async () => {
        debug("[Ledger] - openBleConnection")

        transport.current = await BleTransport.open(deviceId).catch(e => {
            error("[Ledger] - openBleConnection", e)
            throw e
        })

        debug("[Ledger] - connection successful")

        transport.current.on("disconnect", () => {
            warn("[Ledger] - on disconnect")
            setDisconnected(true)
            setRootAccount(undefined)
            setAppOpen(false)
            setCanConnect(false)
            setErrorCode(LEDGER_ERROR_CODES.DISCONNECTED)
            transport.current = undefined
        })

        await pollingLedgerStatus()
    }, [setCanConnect, pollingLedgerStatus, deviceId])

    const attemptBleConnection = useCallback(async () => {
        debug("[Ledger] - attemptAutoConnect")
        setIsConnecting(true)

        try {
            debug("[Ledger] - Attempting to open connection")
            await openBleConnection()
            debug("[Ledger] - Opened connection")
        } catch (e) {
            warn("[Ledger] - Error opening connection", e)
            setErrorCode(LEDGER_ERROR_CODES.UNKNOWN)
        }

        debug("[Ledger] - Finished attempting to open connection")
        setIsConnecting(false)
    }, [openBleConnection])

    // used to connect when the hook is first rendered and autoconnect is enabled
    useEffect(() => {
        const isAutoConnectEnabled = autoConnect && canConnect
        if (isAutoConnectEnabled) {
            attemptBleConnection()
        }
    }, [attemptBleConnection, autoConnect, canConnect])

    // used to connect when we lose connection to the ledger
    useEffect(() => {
        const isDisconnected = !removed && disconnected
        const canTryReconnection = isDisconnected && !isConnecting
        if (canTryReconnection) {
            openBleConnection().finally(() => {
                debug("[Ledger] - Finished attempting to auto connect")
                setDisconnected(false)
            })
        }
    }, [openBleConnection, isConnecting, removed, disconnected])

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
        tryLedgerVerification: checkLedgerStatus,
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
