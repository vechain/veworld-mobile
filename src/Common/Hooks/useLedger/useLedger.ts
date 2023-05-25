import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import VETLedgerApp, { VETLedgerAccount } from "~Common/Ledger/VetLedgerApp"

import { error, info, warn, debug } from "~Common/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerUtils } from "~Common/Utils"
import { LEDGER_ERROR_CODES } from "~Common/Utils/LedgerUtils/LedgerUtils"

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
 */
export const useLedger = (deviceId: string): UseLedgerProps => {
    const transport = useRef<BleTransport | undefined>()

    const [vetApp, setVetApp] = useState<VETLedgerApp>()
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [errorCode, setErrorCode] = useState<LEDGER_ERROR_CODES | undefined>(
        undefined,
    )

    const timer = useRef<NodeJS.Timeout | undefined>(undefined)

    const isReady = useMemo(
        () => isConnected && vetApp && rootAccount,
        [isConnected, vetApp, rootAccount],
    )

    const openConnection = useCallback(async () => {
        try {
            debug("[Ledger] Connecting to device")
            transport.current = await BleTransport.open(deviceId)
            setIsConnected(true)
        } catch (e) {
            error(e)
        }
    }, [deviceId])

    const onConnectionError = useCallback(
        async (err: LEDGER_ERROR_CODES) => {
            if (err === LEDGER_ERROR_CODES.DISCONNECTED) {
                warn("Ledger disconnected")
                transport.current = undefined
                setIsConnected(false)
                await openConnection()
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
        },
        [openConnection],
    )

    const onConnectionSuccess = useCallback(
        (app: VETLedgerApp, account: VETLedgerAccount) => {
            info("[ledger] - connected succesfully")
            setVetApp(app)
            setRootAccount(account)
            setErrorCode(undefined)
        },
        [],
    )

    // transport.on("disconnect", () => {
    //     warn("Ledger disconnected")
    //     setVetApp(undefined)
    //     setRootAccount(undefined)
    //     setConfig(undefined)
    //     setIsConnected(false)
    //     if (onDisconnect) onDisconnect()
    // })

    /**
     * Attempt to connect to the ledger every 3 seconds if not connected
     */
    useEffect(() => {
        timer.current = setInterval(async () => {
            if (!isReady) {
                if (!transport.current) await openConnection()
                else
                    await LedgerUtils.checkLedgerConnection({
                        transport: transport.current,
                        errorCallback: onConnectionError,
                        successCallback: onConnectionSuccess,
                    })
            }
        }, 3000)

        return () => {
            if (timer.current) clearInterval(timer.current)
            if (transport.current) transport.current.close()
        }
    }, [
        deviceId,
        openConnection,
        onConnectionError,
        onConnectionSuccess,
        isReady,
    ])

    return {
        vetApp,
        rootAccount,
        errorCode,
    }
}

/**
 * @field vetApp - a {@link VET} instance that can be used to make requests to the ledger
 * @field rootAccount - The root VET account on the ledger (with chaincode). This can be used to derive further accounts
 * @field errorCode - the last error code that was encountered when attempting to connect to the ledger
 */
interface UseLedgerProps {
    vetApp?: VETLedgerApp
    rootAccount?: VETLedgerAccount
    errorCode: LEDGER_ERROR_CODES | undefined
}
