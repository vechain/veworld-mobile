import { MutableRefObject, useCallback, useRef } from "react"
import { useWithTransport } from "../useWithTransport"
import { ERROR_EVENTS, LEDGER_ERROR_CODES } from "~Constants"
import { LedgerUtils, debug } from "~Utils"
import { Success } from "~Model"
import { VerifyTransportResponse } from "~Utils/LedgerUtils/LedgerUtils"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

const CHECK_LEDGER_STATUS_INTERVAL = 4000

export const usePollingDeviceStatus = ({
    onDeviceAvailable,
    setErrorCode,
    transport,
}: {
    onDeviceAvailable: (res: Success<VerifyTransportResponse>, stopPollingDeviceStatus: () => void) => void
    setErrorCode: (err: LEDGER_ERROR_CODES) => void
    transport: MutableRefObject<BleTransport | undefined>
}) => {
    const withTransport = useWithTransport()
    const pollingStatusInterval = useRef<NodeJS.Timeout | undefined>()

    const stopPollingDeviceStatus = useCallback(() => {
        if (pollingStatusInterval.current) {
            clearInterval(pollingStatusInterval.current)
            pollingStatusInterval.current = undefined
        }
    }, [])

    const checkLedgerStatus = useCallback(async () => {
        if (!transport.current) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingCorrectDeviceSettings] - checkLedgerStatus - no transport found")
            return
        }
        debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus")
        const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

        if (res.success) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - device available to do actions")
            onDeviceAvailable(res, stopPollingDeviceStatus)
        } else {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus - error", res)
            setErrorCode(res.err as LEDGER_ERROR_CODES)
        }
    }, [transport, withTransport, onDeviceAvailable, stopPollingDeviceStatus, setErrorCode])

    const startPollingDeviceStatus = useCallback(async () => {
        if (pollingStatusInterval.current) {
            return
        }
        debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - startPollingDeviceStatus")
        checkLedgerStatus()
        pollingStatusInterval.current = setInterval(() => checkLedgerStatus(), CHECK_LEDGER_STATUS_INTERVAL)
    }, [checkLedgerStatus])

    return {
        startPollingDeviceStatus,
    }
}
