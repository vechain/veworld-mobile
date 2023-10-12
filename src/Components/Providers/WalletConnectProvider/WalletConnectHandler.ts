import { ICore } from "@walletconnect/types"
import { Core } from "@walletconnect/core"
import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet"
import { warn } from "~Utils"

export const core: ICore = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
    // TODO: use a custom storage so we can wipe app state
    logger: "info",
})

let _web3Wallet: IWeb3Wallet | undefined
let resolveInit: () => void = () => {}
const waitForInitialisation = new Promise<void>(resolve => {
    resolveInit = resolve
    warn("Waiting for WalletConnect to initialise")
})

async function init() {
    _web3Wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: "VeWorld Mobile Wallet",
            description: "Manage your VeChain assets with VeWorld",
            url: "https://veworld.com",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
    })
}

init().then(() => {
    warn("WalletConnect initialised, resolving promise")
    resolveInit()
})

export const performWcAction = async <T>(
    action: (web3Wallet: IWeb3Wallet) => T,
) => {
    await waitForInitialisation

    return action(_web3Wallet!)
}
