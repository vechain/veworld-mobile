import { VeChainSigner } from "@vechain/sdk-network"
import { Client, Conversation, Signer } from "@xmtp/react-native-sdk"

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
    return await Client.create(wallet, { env: __DEV__ ? "dev" : "production", dbEncryptionKey: encryptionKey })
}

export const createXmtpClients = async (wallets: Signer[], encryptionKey: Uint8Array) => {
    return await Promise.all(wallets.map(wallet => createXmtpClient(wallet, encryptionKey)))
}

export const loadXmtpClient = async (address: string, encryptionKey: Uint8Array) => {
    return await Client.build(address, { env: __DEV__ ? "dev" : "production", dbEncryptionKey: encryptionKey })
}

export const loadXmtpClients = async (addresses: string[], encryptionKey: Uint8Array) => {
    return await Promise.all(addresses.map(address => loadXmtpClient(address, encryptionKey)))
}

export const initClientListeners = async (client: Client) => {
    return await client.conversations.stream(async (conversation: Conversation<any>) => {
        // console.log("NEW CONVERSATION:", conversation.topic)

        conversation.streamMessages(async () => {
            // console.log("NEW MESSAGE", conversation.topic, message.content())
        })
    })
}
