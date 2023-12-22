import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ERROR_EVENTS, LEDGER_ERROR_CODES, VETLedgerAccount } from "~Constants"

import { debug, error, warn } from "~Utils/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { useScanLedgerDevices } from "~Hooks"
import { LedgerConfig, VerifyTransportResponse } from "~Utils/LedgerUtils/LedgerUtils"
import { Success } from "~Model"
import { useWithTransport } from "../useWithTransport"
import { useLedgerAppConfig } from "../useLedgerAppConfig"
import { usePollingDeviceStatus } from "../usePollingDeviceStatus"
import { usePollingCorrectDeviceSettings } from "../usePollingCorrectDeviceSettings"

const RECONNECT_DEVICE_INTERVAL = 3000
let outsideRenderLoopIsConnecting: boolean = false
let outsideRenderLoopIsConnected: boolean = false
let outsideRenderLoopDisconnectedOnPurpose: boolean = false

/**
 * ***** IMPORTANT *****
 * - every time you enter/exit from an app, the ledger will disconnect, but it handles it and try to reconnect
 * - "disconnectLedger" must be invoked after the ledger action is finished
 */

/**
 * DEBUG INTERNAL LEDGER LOGS:
 * import { listen } from "@ledgerhq/logs"
 * useEffect(() => {
 *     listen(log => {
 *         console.log("[LOG] - ", log)
 *     })
 * }, [])
 */

interface UseLedgerDeviceProps {
    appOpen: boolean
    appConfig: LedgerConfig
    rootAccount?: VETLedgerAccount
    errorCode: LEDGER_ERROR_CODES | undefined
    isConnecting: boolean
    connectLedger: () => Promise<void>
    disconnectLedger: () => Promise<void>
    withTransport?: <T>(func: (t: BleTransport) => Promise<T>) => Promise<T>
    startPollingCorrectDeviceSettings: () => Promise<void>
}

export const useLedgerDevice = ({ deviceId }: { deviceId: string }): UseLedgerDeviceProps => {
    const transport = useRef<BleTransport | undefined>()
    const [appOpen, setAppOpen] = useState<boolean>(false) // check if vechain embedded app is open
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [errorCode, setErrorCode] = useState<LEDGER_ERROR_CODES | undefined>(undefined)
    const withTransport = useWithTransport()
    const { appConfig, setAppConfig } = useLedgerAppConfig({ setErrorCode })

    // when the device is available
    const onDeviceAvailable = useCallback(
        (res: Success<VerifyTransportResponse>, stopPollingDeviceStatus: () => void) => {
            setAppOpen(true)
            setRootAccount({ ...res.payload.rootAccount })
            setAppConfig(res.payload.appConfig.toString().slice(0, 2) as LedgerConfig)
            stopPollingDeviceStatus()
        },
        [setAppConfig],
    )

    const { startPollingDeviceStatus } = usePollingDeviceStatus({
        onDeviceAvailable,
        setErrorCode,
        transport,
    })

    const { startPollingCorrectDeviceSettings } = usePollingCorrectDeviceSettings({
        transport,
        setAppConfig,
        startPollingDeviceStatus,
    })

    const { unsubscribe, scanForDevices, availableDevices } = useScanLedgerDevices({})

    // polling to search for the devices
    // if deviceId is present it searches for related device, if not found it scans again
    const checkDevicePresence = useCallback(
        async (connectLedger: () => Promise<void>) => {
            const ledgerDevice = availableDevices.find(d => d.id === deviceId)
            if (ledgerDevice) {
                if (ledgerDevice.isConnectable) {
                    debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - device found, attempting to connect")
                    await connectLedger()
                } else {
                    debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - device found, but not connectable")
                }
            } else {
                debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - device not found, scanning again")
                scanForDevices()
            }
        },
        [availableDevices, deviceId, scanForDevices],
    )

    const reconnectLedger = useCallback(
        async (connectLedger: () => Promise<void>) => {
            debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - device disconnected")
            outsideRenderLoopIsConnected = false
            setRootAccount(undefined)
            setAppOpen(false)
            setErrorCode(LEDGER_ERROR_CODES.CONNECTING)
            transport.current = undefined
            if (!outsideRenderLoopDisconnectedOnPurpose) {
                debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - trying reconnecting...")
                await checkDevicePresence(connectLedger)
            } else {
                debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - not reconnecting because disconnected on purpose")
            }
        },
        [checkDevicePresence],
    )

    const connectLedger = useCallback(async () => {
        if (outsideRenderLoopIsConnected) {
            debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - skipping - device already connected")
            return
        }
        if (outsideRenderLoopIsConnecting) {
            debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - skipping - device is connecting in another render loop")
            return
        }

        setIsConnecting(true)
        outsideRenderLoopIsConnecting = true

        try {
            debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - Attempting to open connection")
            transport.current = await BleTransport.open(deviceId)

            debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - connection successful")
            outsideRenderLoopIsConnected = true
            transport.current.on("disconnect", () => reconnectLedger(connectLedger))
            await startPollingDeviceStatus()
        } catch (e) {
            warn(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - Error opening connection", e)
            setErrorCode(LEDGER_ERROR_CODES.CONNECTING)
            outsideRenderLoopIsConnected = false
            setTimeout(() => reconnectLedger(connectLedger), RECONNECT_DEVICE_INTERVAL)
        } finally {
            setIsConnecting(false)
            outsideRenderLoopIsConnecting = false
        }
    }, [deviceId, reconnectLedger, startPollingDeviceStatus])

    const disconnectLedger = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - disconnectLedger")
        outsideRenderLoopDisconnectedOnPurpose = true
        if (transport.current) {
            try {
                await BleTransport.disconnectDevice(deviceId)
            } catch (e) {
                error(ERROR_EVENTS.LEDGER, "[useLedgerDevice] - disconnectLedger error: ", e)
            }
        }

        unsubscribe()

        setRootAccount(undefined)
        setErrorCode(undefined)
        transport.current = undefined
    }, [unsubscribe, deviceId])

    const externalWithTransport = useMemo(() => {
        if (!transport.current || !appOpen) return undefined
        return withTransport(transport.current)
    }, [appOpen, withTransport])

    useEffect(() => {
        const scanAndConnectToLedgerIfPresent = async () => {
            outsideRenderLoopDisconnectedOnPurpose = false
            await checkDevicePresence(connectLedger)
        }
        scanAndConnectToLedgerIfPresent()
    }, [checkDevicePresence, connectLedger])

    return {
        appOpen,
        appConfig,
        rootAccount,
        isConnecting,
        errorCode,
        disconnectLedger,
        withTransport: externalWithTransport,
        connectLedger,
        startPollingCorrectDeviceSettings,
    }
}
