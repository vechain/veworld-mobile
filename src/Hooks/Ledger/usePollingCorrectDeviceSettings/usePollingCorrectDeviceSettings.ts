import { MutableRefObject, useCallback, useRef } from "react"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { useWithTransport } from "../useWithTransport"
import LedgerUtils, { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"

const CHECK_CORRECT_SETTINGS_INTERVAL = 4000

export const usePollingCorrectDeviceSettings = ({
    transport,
    setAppConfig,
    startPollingDeviceStatus,
}: {
    transport: MutableRefObject<any>
    setAppConfig: (appConfig: LedgerConfig) => void
    startPollingDeviceStatus: () => Promise<void>
}) => {
    const pollingCorrectDeviceSettingsInterval = useRef<NodeJS.Timeout | undefined>()
    const withTransport = useWithTransport()

    const stopPollingCorrectDeviceSettings = useCallback(() => {
        if (pollingCorrectDeviceSettingsInterval.current) {
            clearInterval(pollingCorrectDeviceSettingsInterval.current)
            pollingCorrectDeviceSettingsInterval.current = undefined
        }
    }, [])

    const checkLedgerCorrectDeviceSettings = useCallback(async () => {
        if (transport.current) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - checkLedgerCorrectDeviceSettings")
            const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

            if (res.success) {
                if (res?.payload?.appConfig === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED) {
                    debug(
                        ERROR_EVENTS.LEDGER,
                        "[usePollingCorrectDeviceSettings] - clause and contract correctly enabled",
                    )
                    stopPollingCorrectDeviceSettings()
                } else {
                    debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - still missing clause or contract")
                }
                setAppConfig(res.payload.appConfig.toString().slice(0, 2) as LedgerConfig)
            } else {
                debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - incorrect device status")
                stopPollingCorrectDeviceSettings()
                startPollingDeviceStatus()
            }
        }
    }, [transport, withTransport, setAppConfig, stopPollingCorrectDeviceSettings, startPollingDeviceStatus])

    const startPollingCorrectDeviceSettings = useCallback(async () => {
        if (pollingCorrectDeviceSettingsInterval.current) {
            return
        }
        debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - polling correct settings")
        checkLedgerCorrectDeviceSettings()
        pollingCorrectDeviceSettingsInterval.current = setInterval(
            checkLedgerCorrectDeviceSettings,
            CHECK_CORRECT_SETTINGS_INTERVAL,
        )
    }, [checkLedgerCorrectDeviceSettings])

    return {
        startPollingCorrectDeviceSettings,
    }
}
