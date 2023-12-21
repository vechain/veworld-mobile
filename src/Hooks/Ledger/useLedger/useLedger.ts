import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ERROR_EVENTS, LEDGER_ERROR_CODES, VETLedgerAccount } from "~Constants"

import { debug, error, warn } from "~Utils/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerUtils } from "~Utils"
import { useScanLedgerDevices } from "~Hooks"
import { Mutex } from "async-mutex"
import { LedgerConfig, VerifyTransportResponse } from "~Utils/LedgerUtils/LedgerUtils"
import { Success } from "~Model"

const TRY_RECONNECT_DEVICE_INTERVAL = 3000
const CHECK_LEDGER_STATUS_INTERVAL = 4000
let pollingStatusInterval: NodeJS.Timeout | undefined
let pollingCorrectSettingsInterval: NodeJS.Timeout | undefined
let outsideRenderLoopIsConnecting: boolean = false
let outsideRenderLoopIsConnected: boolean = false
let outsideRenderLoopDisconnectedOnPurpose: boolean = false

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
export const useLedger = ({ deviceId }: { deviceId: string }): UseLedgerProps => {
    const mutex = useRef<Mutex>(new Mutex())

    const transport = useRef<BleTransport | undefined>()
    const [appOpen, setAppOpen] = useState<boolean>(false)
    const [appConfig, setAppConfig] = useState<LedgerConfig>(LedgerConfig.UNKNOWN)
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [errorCode, setErrorCode] = useState<LEDGER_ERROR_CODES | undefined>(undefined)

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
                    release?.()
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
        if (pollingStatusInterval) {
            clearInterval(pollingStatusInterval)
            pollingStatusInterval = undefined
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
            debug(ERROR_EVENTS.LEDGER, "[useLedger] - checkLedgerStatus")
            const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

            if (res.success) {
                debug(ERROR_EVENTS.LEDGER, "[useLedger] - device available to do actions")
                onDeviceAvailable(res)
            } else {
                debug(ERROR_EVENTS.LEDGER, "[useLedger] - checkLedgerStatus - error", res)
                await setErrorCode(res.err as LEDGER_ERROR_CODES)
            }
        }
    }, [withTransport, onDeviceAvailable])

    const pollingLedgerStatus = useCallback(async () => {
        if (pollingStatusInterval) {
            return
        }
        checkLedgerStatus()
        pollingStatusInterval = setInterval(checkLedgerStatus, CHECK_LEDGER_STATUS_INTERVAL)
    }, [checkLedgerStatus])

    const stopPollingCorrectSettings = useCallback(() => {
        if (pollingCorrectSettingsInterval) {
            clearInterval(pollingCorrectSettingsInterval)
            pollingCorrectSettingsInterval = undefined
        }
    }, [])

    const checkLedgerCorrectSettings = useCallback(async () => {
        if (transport.current) {
            debug(ERROR_EVENTS.LEDGER, "[useLedger] - checkLedgerCorrectSettings")
            const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

            if (res.success) {
                if (res?.payload?.appConfig === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED) {
                    stopPollingCorrectSettings()
                }
                setConfig(res.payload.appConfig.toString().slice(0, 2) as LedgerConfig)
            }
        }
    }, [withTransport, stopPollingCorrectSettings, setConfig])

    const pollingCorrectSettings = useCallback(async () => {
        if (pollingCorrectSettingsInterval) {
            return
        }
        checkLedgerCorrectSettings()
        pollingCorrectSettingsInterval = setInterval(checkLedgerCorrectSettings, CHECK_LEDGER_STATUS_INTERVAL)
    }, [checkLedgerCorrectSettings])

    const { unsubscribe, scanForDevices, availableDevices } = useScanLedgerDevices({})

    // polling to search for the devices
    // if deviceId is present it searches for related device, if not found, it unsubscribes and scans again
    const checkDevicePresence = useCallback(
        async (connectDevice: () => void) => {
            const ledgerDevice = availableDevices.find(d => d.id === deviceId)
            if (ledgerDevice) {
                if (ledgerDevice.isConnectable) {
                    debug(ERROR_EVENTS.LEDGER, "[useLedger] - device found, attempting to connect")
                    await connectDevice()
                } else {
                    debug(ERROR_EVENTS.LEDGER, "[useLedger] - device found, but not connectable")
                }
            } else {
                debug(ERROR_EVENTS.LEDGER, "[useLedger] - device not found, scanning again")
                scanForDevices()
            }
        },
        [availableDevices, deviceId, scanForDevices],
    )

    const connectDevice = useCallback(async () => {
        if (outsideRenderLoopIsConnected) {
            debug(ERROR_EVENTS.LEDGER, "[useLedger] - skipping - device already connected")
            return
        }
        if (outsideRenderLoopIsConnecting) {
            debug(ERROR_EVENTS.LEDGER, "[useLedger] - skipping - device is connecting in another render loop")
            return
        }

        const reconnectDevice = async () => {
            debug(ERROR_EVENTS.LEDGER, "[useLedger] - triggered reconnectDevice")
            outsideRenderLoopIsConnected = false
            setRootAccount(undefined)
            setAppOpen(false)
            setErrorCode(LEDGER_ERROR_CODES.DISCONNECTED)
            transport.current = undefined
            if (!outsideRenderLoopDisconnectedOnPurpose) {
                debug(ERROR_EVENTS.LEDGER, "[useLedger] - trying to connect after disconnected")
                await checkDevicePresence(connectDevice)
            } else {
                debug(ERROR_EVENTS.LEDGER, "[useLedger] - not connected because disconnected on purpose")
            }
        }

        setIsConnecting(true)
        outsideRenderLoopIsConnecting = true

        try {
            debug(ERROR_EVENTS.LEDGER, "[useLedger] - Attempting to open connection")
            transport.current = await BleTransport.open(deviceId)

            debug(ERROR_EVENTS.LEDGER, "[useLedger] - connection successful")
            outsideRenderLoopIsConnected = true
            transport.current.on("disconnect", reconnectDevice)
            await pollingLedgerStatus()
        } catch (e) {
            warn(ERROR_EVENTS.LEDGER, "[useLedger] - Error opening connection", e)
            setErrorCode(LEDGER_ERROR_CODES.UNKNOWN)
            outsideRenderLoopIsConnected = false
            setTimeout(reconnectDevice, TRY_RECONNECT_DEVICE_INTERVAL)
        } finally {
            setIsConnecting(false)
            outsideRenderLoopIsConnecting = false
        }
    }, [checkDevicePresence, deviceId, pollingLedgerStatus])

    const externalWithTransport = useMemo(() => {
        if (!transport.current || !appOpen) return undefined
        return withTransport(transport.current)
    }, [appOpen, withTransport])

    const removeLedger = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "[useLedger] - removeLedger")
        outsideRenderLoopDisconnectedOnPurpose = true
        if (transport.current) {
            try {
                await BleTransport.disconnectDevice(deviceId)
            } catch (e) {
                error(ERROR_EVENTS.LEDGER, "ledger:close", e)
            }
        }

        unsubscribe()

        setRootAccount(undefined)
        setErrorCode(undefined)
        transport.current = undefined
    }, [unsubscribe, deviceId])

    const scanAndConnectToDeviceIfPresent = useCallback(async () => {
        outsideRenderLoopDisconnectedOnPurpose = false
        await checkDevicePresence(connectDevice)
    }, [checkDevicePresence, connectDevice])

    useEffect(() => {
        scanAndConnectToDeviceIfPresent()
    }, [scanAndConnectToDeviceIfPresent])

    return {
        appOpen,
        appConfig,
        rootAccount,
        isConnecting,
        errorCode,
        removeLedger,
        withTransport: externalWithTransport,
        tryLedgerConnection: connectDevice,
        tryLedgerVerification: checkLedgerStatus,
        pollingLedgerStatus,
        pollingCorrectSettings,
        scanAndConnectToDeviceIfPresent,
    }
}

/**
 * @field vetApp - a {@link VET} instance that can be used to make requests to the ledger
 * @field rootAccount - The root VET account on the ledger (with chaincode). This can be used to derive further accounts
 * @field errorCode - the last error code that was encountered when attempting to connect to the ledger
 * @field openOrFinalizeConnection - a function that can be used to manually attempt to connect to the ledger - does not recreate transport if already exists
 * connectDevice - a function that can be used to manually attempt to connect to the ledger - recreate transport if already exists
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
    pollingLedgerStatus: () => Promise<void>
    pollingCorrectSettings: () => Promise<void>
    scanAndConnectToDeviceIfPresent: () => Promise<void>
}
