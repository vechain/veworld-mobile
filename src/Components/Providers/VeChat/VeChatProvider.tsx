import { Secp256k1, HexUInt } from "@vechain/sdk-core"
import {
    ProviderInternalBaseWallet,
    ProviderInternalWalletAccount,
    ThorClient,
    VeChainProvider,
    VeChainSigner,
} from "@vechain/sdk-network"
import { Client } from "@xmtp/react-native-sdk"
import React, { useCallback, useEffect, useState } from "react"
import { HDNode } from "thor-devkit"
import { DEVICE_TYPE, Wallet } from "~Model"
import {
    addXmtpClient,
    getDbEncryptionKey,
    selectDevice,
    selectRegisteredClients,
    selectSelectedAccount,
    selectSelectedNetwork,
    setDbEncryptionKey,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { convertAccountToXmtpSigner, createXmtpClient, error, initClientListeners, loadXmtpClients } from "~Utils"
import { WalletEncryptionKeyHelper } from "../EncryptedStorageProvider"

type VeChatContextProps = { children: React.ReactNode }

interface VeChatContextValue {
    clients: Client[]
    newClient: (pinCode?: string) => void
}

export const VeChatContext = React.createContext<VeChatContextValue | undefined>(undefined)

const VeChatContextProvider: React.FC<VeChatContextProps> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([])

    const currentAccount = useAppSelector(selectSelectedAccount)
    const signerDevice = useAppSelector(state => selectDevice(state, currentAccount.rootAddress))

    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const registeredClients = useAppSelector(selectRegisteredClients)
    const dbEncryptionKey = useAppSelector(getDbEncryptionKey)
    const dispatch = useAppDispatch()

    const generateDbEncryptionKey = useCallback(async () => {
        if (!dbEncryptionKey) {
            const randomBytes = await Secp256k1.randomBytes(32)
            dispatch(setDbEncryptionKey(HexUInt.of(randomBytes).toString()))
        }
    }, [dbEncryptionKey, dispatch])

    const initRegisteredClients = useCallback(async () => {
        if (!dbEncryptionKey) {
            error("APP", "Cannot load database encryption key")
            return
        }
        const loadedClients = await loadXmtpClients(registeredClients, dbEncryptionKey)

        loadedClients.forEach(initClientListeners)
        setClients(loadedClients)

        // console.log("REGISTERED CLIENTS", registeredClients, dbEncryptionKey)
    }, [dbEncryptionKey, registeredClients])

    const newClient = useCallback(
        async (pinCode?: string) => {
            if (!dbEncryptionKey) throw new Error("Cannot create a new client no keys found")
            if (!signerDevice) throw new Error("No device found to create a signer")
            if (signerDevice.type === DEVICE_TYPE.LEDGER) throw new Error("Ledger devices not supported in this hook")

            const thorClient = ThorClient.at(selectedNetwork.currentUrl)
            const wallet: Wallet = await WalletEncryptionKeyHelper.decryptWallet({
                encryptedWallet: signerDevice.wallet,
                pinCode,
            })

            const hdNode = HDNode.fromMnemonic(wallet.mnemonic!)
            const derivedNode = hdNode.derive(currentAccount.index)

            const privateKey = derivedNode.privateKey as Buffer

            const deployerAccount: ProviderInternalWalletAccount = {
                address: currentAccount.address,
                privateKey,
            }

            const provider = new VeChainProvider(thorClient, new ProviderInternalBaseWallet([deployerAccount]))
            const vechainSigner = (await provider.getSigner(deployerAccount.address)) as VeChainSigner

            if (!vechainSigner) throw new Error("Invalid signer")

            const signer = convertAccountToXmtpSigner(vechainSigner)
            const client = await createXmtpClient(signer, dbEncryptionKey)

            dispatch(addXmtpClient(client.address))
            setClients(prev => [...prev, client])

            // Clean up thor client and provider to avoid duplicate polling
            thorClient.destroy()
            provider.destroy()
        },
        [currentAccount, dbEncryptionKey, selectedNetwork.currentUrl, signerDevice, dispatch],
    )

    useEffect(() => {
        generateDbEncryptionKey()
    }, [generateDbEncryptionKey])

    useEffect(() => {
        // Load all clients
        if (dbEncryptionKey) initRegisteredClients()
        return () => {
            clients.forEach(client => client.conversations.cancelStreamAllMessages())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dbEncryptionKey, dispatch, initRegisteredClients])

    const value: VeChatContextValue = {
        clients,
        newClient,
    }

    return <VeChatContext.Provider value={value}>{children}</VeChatContext.Provider>
}

const useVeChat = () => {
    const context = React.useContext(VeChatContext)
    if (!context) {
        throw new Error("useVeChat Context must be used within a VeChatContextProvider")
    }

    return context
}

export { VeChatContextProvider, useVeChat }
