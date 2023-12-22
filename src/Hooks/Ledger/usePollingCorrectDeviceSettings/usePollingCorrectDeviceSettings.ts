/* eslint-disable max-len */
import { MutableRefObject, useCallback, useRef } from "react"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { useWithTransport } from "../useWithTransport"
import LedgerUtils, { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"

const CHECK_CORRECT_SETTINGS_INTERVAL = 5000
const MAX_POLLING_ATTEMPS = 50

export const usePollingCorrectDeviceSettings = ({
    transport,
    setAppConfig,
    startPollingDeviceStatus,
    detachedDisconnectedOnPurpose,
}: {
    transport: MutableRefObject<any>
    setAppConfig: (appConfig: LedgerConfig) => void
    startPollingDeviceStatus: () => Promise<void>
    detachedDisconnectedOnPurpose: MutableRefObject<boolean>
}) => {
    const pollingAttempts = useRef<number>(0)
    const pollingCorrectDeviceSettingsInterval = useRef<NodeJS.Timeout | undefined>()
    const withTransport = useWithTransport()

    const stopPollingCorrectDeviceSettings = useCallback(() => {
        debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - stopPollingCorrectDeviceSettings")
        if (pollingCorrectDeviceSettingsInterval.current) {
            pollingAttempts.current = 0
            clearInterval(pollingCorrectDeviceSettingsInterval.current)
            pollingCorrectDeviceSettingsInterval.current = undefined
        }
    }, [])

    const checkLedgerCorrectDeviceSettings = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings")
        if (!transport.current) {
            debug(
                ERROR_EVENTS.LEDGER,
                "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings - no transport found",
            )
            return
        }
        if (pollingAttempts.current > MAX_POLLING_ATTEMPS) {
            debug(
                ERROR_EVENTS.LEDGER,
                "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings - max polling attempts reached",
            )
            stopPollingCorrectDeviceSettings()
            return
        }
        const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

        if (res.success) {
            if (res?.payload?.appConfig === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED) {
                debug(
                    ERROR_EVENTS.LEDGER,
                    "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings - clause and contract correctly enabled",
                )
                stopPollingCorrectDeviceSettings()
            } else {
                debug(
                    ERROR_EVENTS.LEDGER,
                    "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings - still missing clause or contract",
                )
            }
            setAppConfig(res.payload.appConfig.toString().slice(0, 2) as LedgerConfig)
        } else {
            debug(
                ERROR_EVENTS.LEDGER,
                "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings - incorrect device status",
            )
            stopPollingCorrectDeviceSettings()
            if (!detachedDisconnectedOnPurpose.current) {
                startPollingDeviceStatus()
            }
        }
    }, [
        transport,
        withTransport,
        stopPollingCorrectDeviceSettings,
        setAppConfig,
        detachedDisconnectedOnPurpose,
        startPollingDeviceStatus,
    ])

    const startPollingCorrectDeviceSettings = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - startPollingCorrectDeviceSettings")
        if (pollingCorrectDeviceSettingsInterval.current) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - interval already set")
            return
        }
        checkLedgerCorrectDeviceSettings()
        pollingCorrectDeviceSettingsInterval.current = setInterval(
            () => checkLedgerCorrectDeviceSettings(),
            CHECK_CORRECT_SETTINGS_INTERVAL,
        )
    }, [checkLedgerCorrectDeviceSettings])

    return {
        startPollingCorrectDeviceSettings,
        stopPollingCorrectDeviceSettings,
    }
}
