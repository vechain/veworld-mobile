import { VeChainSigner } from "@vechain/sdk-network"
import { Client, Conversation, DecodedMessage, Signer } from "@xmtp/react-native-sdk"
import { queryClient } from "~Api/QueryProvider"
import { info } from "~Utils/Logger"

export const convertAccountToXmtpSigner = (accout: VeChainSigner): Signer => {
    return {
        getAddress: async () => await accout.getAddress(),
        signMessage: async message => await accout.signMessage(message),
        getBlockNumber: () => undefined,
        getChainId: () => undefined,
        walletType: () => undefined,
    }
}

export const createXmtpClient = async (wallet: Signer, encryptionKey: Uint8Array) => {
    return await Client.create(wallet, {
        env: "production",
        dbEncryptionKey: encryptionKey,
        preAuthenticateToInboxCallback: () => {},
    })
}

export const createXmtpClients = async (wallets: Signer[], encryptionKey: Uint8Array) => {
    return await Promise.all(wallets.map(wallet => createXmtpClient(wallet, encryptionKey)))
}

export const loadXmtpClient = async (address: string, encryptionKey: Uint8Array) => {
    return await Client.build(address, {
        env: "production",
        dbEncryptionKey: encryptionKey,
        preAuthenticateToInboxCallback: () => {},
    })
}

export const loadXmtpClients = async (addresses: string[], encryptionKey: Uint8Array) => {
    return await Promise.all(addresses.map(address => loadXmtpClient(address, encryptionKey)))
}

export const initClientListeners = async (client: Client) => {
    info("APP", client.address, client.inboxId)
    // if (convo?.state === "unknown") convo?.updateConsent("allowed")
    await client.conversations.stream(async (conversation: Conversation<any>) => {
        // console.log("NEW CONVERSATION:", conversation.state, conversation.topic)
        queryClient.setQueryData<Conversation[]>(["veChat", "conversations", client.address], oldConv =>
            oldConv ? [...oldConv, conversation] : [conversation],
        )

        // conversation.streamMessages(async (message: DecodedMessage<any>) => {
        //     console.log("NEW MESSAGE", conversation.topic, message.content())
        // })
    })
    await client.conversations.streamAllMessages(async msg => {
        // console.log("EXISTING CONVO MSG", msg.topic, msg.content())
        queryClient.setQueryData<DecodedMessage[]>(["veChat", "messages", client.address, msg.topic], oldMsgs =>
            oldMsgs && !oldMsgs.some(oldMsg => oldMsg.id === msg.id) ? [msg, ...oldMsgs] : [msg],
        )
        // const currentConv = await client.conversations.findConversationByTopic(msg.topic)
    })
}
