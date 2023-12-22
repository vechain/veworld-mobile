import { MutableRefObject, useCallback, useRef } from "react"
import { useWithTransport } from "../useWithTransport"
import { ERROR_EVENTS, LEDGER_ERROR_CODES } from "~Constants"
import { LedgerUtils, debug } from "~Utils"
import { Success } from "~Model"
import { VerifyTransportResponse } from "~Utils/LedgerUtils/LedgerUtils"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

const CHECK_LEDGER_STATUS_INTERVAL = 5000
const MAX_POLLING_ATTEMPS = 50

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
    const pollingAttempts = useRef<number>(0)
    const pollingStatusInterval = useRef<NodeJS.Timeout | undefined>()

    const stopPollingDeviceStatus = useCallback(() => {
        debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - stopPollingDeviceStatus")
        if (pollingStatusInterval.current) {
            pollingAttempts.current = 0
            clearInterval(pollingStatusInterval.current)
            pollingStatusInterval.current = undefined
        }
    }, [])

    const checkLedgerStatus = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus")
        if (!transport.current) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus - no transport found")
            return
        }
        if (pollingAttempts.current > MAX_POLLING_ATTEMPS) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus - max polling attempts reached")
            stopPollingDeviceStatus()
            return
        }

        const res = await LedgerUtils.verifyTransport(withTransport(transport.current))

        if (res.success) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus - device available to do actions")
            onDeviceAvailable(res, stopPollingDeviceStatus)
        } else {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - checkLedgerStatus - error", res)
            setErrorCode(res.err as LEDGER_ERROR_CODES)
        }
    }, [transport, withTransport, onDeviceAvailable, stopPollingDeviceStatus, setErrorCode])

    const startPollingDeviceStatus = useCallback(async () => {
        debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - startPollingDeviceStatus")
        if (pollingStatusInterval.current) {
            debug(ERROR_EVENTS.LEDGER, "[usePollingDeviceStatus] - interval already set")
            return
        }
        checkLedgerStatus()
        pollingStatusInterval.current = setInterval(() => checkLedgerStatus(), CHECK_LEDGER_STATUS_INTERVAL)
    }, [checkLedgerStatus])

    return {
        startPollingDeviceStatus,
        stopPollingDeviceStatus,
    }
}
