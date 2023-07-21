import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LEDGER_ERROR_CODES, VETLedgerAccount, VETLedgerApp } from "~Constants"

import { debug, error, info, warn } from "~Utils/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerUtils } from "~Utils"

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
    waitFirstManualConnection = false,
    onConnectionError: handleOnConnectionError,
}: {
    deviceId: string
    waitFirstManualConnection: boolean
    onConnectionError?: (err: LEDGER_ERROR_CODES) => void
}): UseLedgerProps => {
    const transport = useRef<BleTransport | undefined>()

    const [vetApp, setVetApp] = useState<VETLedgerApp>()
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [errorCode, setErrorCode] = useState<LEDGER_ERROR_CODES | undefined>(
        undefined,
    )

    const timer = useRef<NodeJS.Timeout | undefined>(undefined)
    const [timerEnabled, setTimerEnabled] = useState<boolean>(
        !waitFirstManualConnection,
    )

    const isReady = useMemo(() => vetApp && rootAccount, [vetApp, rootAccount])

    const removeLedger = useCallback(async () => {
        debug("disconnect")
        if (transport.current) {
            try {
                await transport.current?.device.cancelConnection()
            } catch (e) {
                error("ledger:cancelConnection", e)
            }

            try {
                await transport.current?.close()
            } catch (e) {
                error("ledger:close", e)
            }

            setVetApp(undefined)
            setRootAccount(undefined)
            setErrorCode(undefined)
            setIsConnecting(true)
            transport.current = undefined
        }
    }, [])

    const openBleConnection = useCallback(async () => {
        try {
            debug("[Ledger] Connecting to device")
            transport.current = await BleTransport.open(deviceId)
        } catch (e) {
            error("[Ledger] - Error opening connection", e)
            setErrorCode(LEDGER_ERROR_CODES.DISCONNECTED)
            handleOnConnectionError?.(LEDGER_ERROR_CODES.DISCONNECTED)
        }
    }, [deviceId, handleOnConnectionError])

    const onConnectionError = useCallback(
        async (err: LEDGER_ERROR_CODES) => {
            error("onConnectionError", err)
            if (err === LEDGER_ERROR_CODES.DISCONNECTED) {
                warn("Ledger disconnected")
                await transport.current?.close()
                transport.current = undefined
                await openBleConnection()
            }
            if (err === LEDGER_ERROR_CODES.OFF_OR_LOCKED) {
                warn("Ledger is off or locked")
            }
            if (err === LEDGER_ERROR_CODES.NO_VET_APP) {
                warn("Ledger has no VET app")
            }
            if (err === LEDGER_ERROR_CODES.UNKNOWN) {
                warn("Ledger error")
            }
            setErrorCode(err)
            handleOnConnectionError?.(err)
        },
        [openBleConnection, handleOnConnectionError],
    )

    const onConnectionSuccess = useCallback(
        async (app: VETLedgerApp, account: VETLedgerAccount) => {
            info("[ledger] - connected succesfully")
            setVetApp(app)
            setRootAccount(account)
            //config is calculated in useEffect
            setErrorCode(undefined)
        },
        [],
    )

    const openOrFinalizeConnection = useCallback(async () => {
        setIsConnecting(true)
        await openBleConnection()
        if (transport.current)
            await LedgerUtils.checkLedgerConnection({
                transport: transport.current,
                errorCallback: onConnectionError,
                successCallback: onConnectionSuccess,
            })

        setIsConnecting(false)
        setTimerEnabled(true)
    }, [openBleConnection, onConnectionError, onConnectionSuccess])

    /**
     * Attempt to connect to the ledger every 3 seconds if not connected
     */
    useEffect(() => {
        if (!isReady) openOrFinalizeConnection()

        timer.current = setInterval(async () => {
            if (!isReady && timerEnabled) await openOrFinalizeConnection()
        }, 3000)

        return () => {
            if (timer.current) clearInterval(timer.current)
        }
    }, [openOrFinalizeConnection, isReady, timerEnabled])

    return {
        vetApp,
        rootAccount,
        errorCode,
        openOrFinalizeConnection,
        openBleConnection,
        isConnecting,
        setTimerEnabled,
        transport: transport.current,
        removeLedger,
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
    vetApp?: VETLedgerApp
    rootAccount?: VETLedgerAccount
    errorCode: LEDGER_ERROR_CODES | undefined
    openOrFinalizeConnection: () => Promise<void>
    openBleConnection: () => Promise<void>
    isConnecting: boolean
    setTimerEnabled: (enabled: boolean) => void
    transport: BleTransport | undefined
    removeLedger: () => Promise<void>
}
