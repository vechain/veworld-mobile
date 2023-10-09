import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet"
import { ICore, SessionTypes } from "@walletconnect/types"
import { Core } from "@walletconnect/core"
import { wcStorage } from "~Storage/WalletConnect"
import { ErrorResponse } from "@walletconnect/jsonrpc-utils"
import { debug } from "~Utils"
import { WalletConnectRequest } from "~Storage/Redux"
import { JsonRpcResult } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"
import { Web3WalletTypes } from "@walletconnect/web3wallet/dist/types/types/client"

const core: ICore = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
    storage: wcStorage,
    logger: "info",
})

class WalletConnectService {
    private static instance: WalletConnectService | null = null
    private readonly web3Wallet: Promise<IWeb3Wallet>

    // Private constructor to prevent external instantiation
    private constructor() {
        this.web3Wallet = Web3Wallet.init({
            core,
            metadata: {
                name: "VeWorld Mobile Wallet",
                description: "Manage your VeChain assets with VeWorld",
                url: "https://veworld.com",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
            },
        })
    }

    //

    // Static method to provide access to the Singleton instance
    static getInstance(): WalletConnectService {
        if (this.instance === null) {
            this.instance = new WalletConnectService()
        }
        return this.instance
    }

    public getActiveSessions = async (): Promise<
        Record<string, SessionTypes.Struct>
    > => {
        const web3Wallet = await this.web3Wallet
        return web3Wallet.getActiveSessions()
    }

    public rejectSession = async (
        id: number,
        reason: ErrorResponse,
    ): Promise<void> => {
        const web3Wallet = await this.web3Wallet
        await web3Wallet.rejectSession({
            id,
            reason,
        })
    }

    public disconnectSession = async (
        topic: string,
        reason: ErrorResponse,
    ): Promise<void> => {
        const web3Wallet = await this.web3Wallet
        await web3Wallet.disconnectSession({
            topic,
            reason,
        })
    }

    public approveSession = async (
        id: number,
        namespaces: Record<string, SessionTypes.Namespace>,
    ): Promise<SessionTypes.Struct> => {
        const web3Wallet = await this.web3Wallet
        return await web3Wallet.approveSession({
            id,
            namespaces,
        })
    }

    public rejectRequest = async (
        requestId: number,
        topic: string,
        response: ErrorResponse,
    ): Promise<void> => {
        const web3Wallet = await this.web3Wallet
        await web3Wallet.respondSessionRequest({
            topic: topic,
            response: {
                id: requestId,
                jsonrpc: "2.0",
                error: response,
            },
        })
    }

    public processRequest = async <T>(
        request: WalletConnectRequest,
        response: JsonRpcResult<T>["result"],
    ): Promise<void> => {
        const web3Wallet = await this.web3Wallet
        await web3Wallet.respondSessionRequest({
            topic: request.topic,
            response: {
                id: request.requestId,
                jsonrpc: "2.0",
                result: response,
            },
        })
    }

    public pair = async (uri: string): Promise<void> => {
        const pairing = await core.pairing.pair({
            uri,
            activatePairing: true,
        })
        debug("WalletConnectProvider:onPair - pair", pairing.relay)
    }

    public respondToRequest = async <T>(
        request: WalletConnectRequest,
        response: JsonRpcResult<T>["result"],
    ): Promise<void> => {
        const web3Wallet = await this.web3Wallet
        await web3Wallet.respondSessionRequest({
            topic: request.topic,
            response: {
                id: request.requestId,
                jsonrpc: "2.0",
                result: response,
            },
        })
    }

    public addEventListener<E extends Web3WalletTypes.Event>(
        event: E,
        listener: (args: Web3WalletTypes.EventArguments[E]) => void,
    ) {
        this.addEventListenerAsync(event, listener)
            .then(() => debug("Added new WC event listener", event))
            .catch(error => {
                error("Failed to add new WC event listener", event, error)
            })
    }

    private async addEventListenerAsync<E extends Web3WalletTypes.Event>(
        event: E,
        listener: (args: Web3WalletTypes.EventArguments[E]) => void,
    ) {
        const web3Wallet = await this.web3Wallet
        web3Wallet.events.on(event, listener)
    }
}

const walletConnectService = WalletConnectService.getInstance()

export default walletConnectService
