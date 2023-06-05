import { Core } from "@walletconnect/core"
import { ICore } from "@walletconnect/types"
import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet"

export const VECHAIN_SIGNING_METHODS = {
    IDENTIFY: "identify",
    REQUEST_TRANSACTION: "request_transaction",
}

let web3wallet: IWeb3Wallet
export const core: ICore = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

export async function getWeb3Wallet() {
    if (web3wallet) {
        return web3wallet
    }

    web3wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: "VeWorld Mobile Wallet",
            description: "Manage your VeChain assets with VeWorld",
            url: "https://walletconnect.com/",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
    })

    return web3wallet
}
