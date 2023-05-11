import { useEffect, useMemo, useState } from "react"
import VETLedgerApp, {
    VETLedgerAccount,
    VET_DERIVATION_PATH,
} from "~Common/Ledger/VetLedgerApp"

import { error, warn } from "~Common/Logger"
import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { ConnectedLedgerDevice } from "~Model"

export enum LedgerStatus {
    NOT_CONNECTED = "NOT_CONNECTED",
    APP_NOT_OPEN = "APP_NOT_OPEN",
    READY = "READY",
}

export enum LedgerConfig {
    CLAUSE_AND_CONTRACT_ENABLED = "03010007",
    CLAUSE_ONLY_ENABLED = "02010007",
    CONTRACT_ONLY_ENABLED = "01010007",
    CLAUSE_AND_CONTRACT_DISABLED = "00010007",
}

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
const useLedger = (
    device: ConnectedLedgerDevice,
    onDisconnect?: () => void,
): UseLedgerProps => {
    const [vetApp, setVetApp] = useState<VETLedgerApp>()
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [rootAccount, setRootAccount] = useState<VETLedgerAccount>()
    const [config, setConfig] = useState<string>()

    const status = useMemo(() => {
        if (isConnected && vetApp && rootAccount) return LedgerStatus.READY
        if (isConnected) return LedgerStatus.APP_NOT_OPEN
        return LedgerStatus.NOT_CONNECTED
    }, [isConnected, vetApp, rootAccount])

    const getRootAccount = async (vet: VETLedgerApp) => {
        const account = await vet.getAccount(VET_DERIVATION_PATH, false, true)
        setRootAccount(account)
    }

    const setAppConfig = async (app: VETLedgerApp) => {
        const appConfig = await app.getAppConfiguration()
        const appConfigHex = appConfig.toString("hex")
        setConfig(appConfigHex)
    }

    const createConnection = async (): Promise<VETLedgerApp> => {
        if (vetApp !== undefined) return vetApp

        const transport = await BleTransport.open(device.id)

        transport.on("disconnect", () => {
            warn("Ledger disconnected")
            setVetApp(undefined)
            setRootAccount(undefined)
            setConfig(undefined)
            setIsConnected(false)
            if (onDisconnect) onDisconnect()
        })

        setIsConnected(true)

        const app = new VETLedgerApp(transport)

        await setAppConfig(app)

        setVetApp(app)

        return app
    }

    const connect = async () => {
        try {
            //Attempt to create ledger connection
            await createConnection()
        } catch (e) {
            error(e)
        }
    }

    useEffect(() => {
        //Attempt initial connect
        connect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        //Attempt to get the root account. This will ensure the app is open
        if (vetApp !== undefined) getRootAccount(vetApp)
        return () => {
            //Close the connection when the hook unmounts
            if (vetApp !== undefined) vetApp.transport.close()
        }
    }, [vetApp])

    return {
        vetApp,
        rootAccount,
        connect,
        status,
        config,
    }
}

/**
 * @field vetApp - a {@link VET} instance that can be used to make requests to the ledger
 * @field rootAccount - The root VET account on the ledger (with chaincode). This can be used to derive further accounts
 * @field connect - a function to make another connection/ account attempt with the ledger
 * @field status - the current status of the ledger connection
 * @field config - the current app config of the ledger
 */
interface UseLedgerProps {
    vetApp?: VETLedgerApp
    rootAccount?: VETLedgerAccount
    connect: () => void
    status: LedgerStatus
    config?: string
}

export default useLedger
