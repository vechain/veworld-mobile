import { Secp256k1, HexUInt } from "@vechain/sdk-core"
import {
    ProviderInternalBaseWallet,
    ProviderInternalWalletAccount,
    ThorClient,
    VeChainProvider,
    VeChainSigner,
} from "@vechain/sdk-network"
import { Client, Conversation } from "@xmtp/react-native-sdk"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { HDNode } from "thor-devkit"
import { DEVICE_TYPE, Wallet } from "~Model"
import {
    addConversation,
    addXmtpClient,
    getDbEncryptionKey,
    selectDevice,
    selectRegisteredClients,
    selectSelectedAccountOrNull,
    selectSelectedNetwork,
    setDbEncryptionKey,
    updateConversation,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { convertAccountToXmtpSigner, createXmtpClient, error, info, loadXmtpClients } from "~Utils"
import { WalletEncryptionKeyHelper } from "../EncryptedStorageProvider"
import { useQueryClient } from "@tanstack/react-query"
import { VeChatConversation } from "~Storage/Redux/Types"

type VeChatContextProps = { children: React.ReactNode }

interface VeChatContextValue {
    clients: Client[]
    selectedClient: Client | undefined
    newClient: (pinCode?: string) => void
    deleteAllChatsDb: () => Promise<void>
}

export const VeChatContext = React.createContext<VeChatContextValue | undefined>(undefined)

const VeChatContextProvider: React.FC<VeChatContextProps> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([])

    const currentAccount = useAppSelector(selectSelectedAccountOrNull)
    const signerDevice = useAppSelector(state => selectDevice(state, currentAccount?.rootAddress))
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const registeredClients = useAppSelector(selectRegisteredClients)
    const dbEncryptionKey = useAppSelector(getDbEncryptionKey)

    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const selectedClient = useMemo(() => {
        return clients.find(client => client.address === currentAccount?.address)
    }, [clients, currentAccount?.address])

    const generateDbEncryptionKey = useCallback(async () => {
        if (!dbEncryptionKey) {
            const randomBytes = await Secp256k1.randomBytes(32)
            dispatch(setDbEncryptionKey(HexUInt.of(randomBytes).toString()))
        }
    }, [dbEncryptionKey, dispatch])

    const initListeners = useCallback(
        async (client: Client) => {
            info("VE_CHAT", client.address, client.inboxId)

            await client.conversations.stream(async (conversation: Conversation<any>) => {
                const currentTimestamp = new Date().getTime()

                // Update conversations when a new one is retreived
                queryClient.refetchQueries({ queryKey: ["veChat", "conversations", client.address] })

                const messages = await conversation.messages()

                const conversationState: VeChatConversation = {
                    createdAt: currentTimestamp,
                    updatedAt: currentTimestamp,
                    unreadMessages: messages.length,
                    lastRead: currentTimestamp - 1,
                }
                dispatch(addConversation({ topic: conversation.topic, conversation: conversationState }))
            })
            await client.conversations.streamAllMessages(async msg => {
                const currentTimestamp = new Date().getTime()

                // Refetch messages of a specific conversation
                queryClient.refetchQueries({ queryKey: ["veChat", "messages", client.address, msg.topic] })

                //TODO: handle the unread messages counter when receiving a new message
                if (msg.senderAddress !== client.inboxId) {
                    dispatch(
                        updateConversation({
                            topic: msg.topic,
                            conversation: { updatedAt: currentTimestamp, unreadMessages: 1 },
                        }),
                    )
                }
            })
        },
        [dispatch, queryClient],
    )

    const initRegisteredClients = useCallback(async () => {
        if (!dbEncryptionKey) {
            error("APP", "Cannot load database encryption key")
            return
        }
        const loadedClients = await loadXmtpClients(registeredClients, dbEncryptionKey)
        loadedClients.forEach(initListeners)
        setClients(loadedClients)

        // console.log("REGISTERED CLIENTS", registeredClients, dbEncryptionKey)
    }, [dbEncryptionKey, initListeners, registeredClients])

    const newClient = useCallback(
        async (pinCode?: string) => {
            if (!dbEncryptionKey) throw new Error("Cannot create a new client no keys found")
            if (!signerDevice) throw new Error("No device found to create a signer")
            if (!currentAccount) throw new Error("No current account")
            if (signerDevice.type === DEVICE_TYPE.LEDGER) throw new Error("Ledger devices not supported in this hook")
            try {
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
            } catch (e) {
                error("APP", e)
            }
        },
        [currentAccount, dbEncryptionKey, selectedNetwork.currentUrl, signerDevice, dispatch],
    )

    const deleteAllChatsDb = useCallback(async () => {
        await clients.forEach(async client => client.deleteLocalDatabase())
    }, [clients])

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
        selectedClient,
        newClient,
        deleteAllChatsDb,
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
