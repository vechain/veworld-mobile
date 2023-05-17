import "@walletconnect/react-native-compat"
import "@ethersproject/shims"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedAccount } from "~Storage/Redux/Selectors"
import { Core } from "@walletconnect/core"
import { ICore } from "@walletconnect/types"
import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet"
import { useState, useCallback, useEffect } from "react"

export let web3wallet: IWeb3Wallet
export let core: ICore
export let currentETHAddress: string

async function createWeb3Wallet() {
    // HardCoding it here for ease of tutorial
    // Paste your project ID here
    const ENV_PROJECT_ID = "6755c2b1587a2f7f734c844f02d35724"
    core = new Core({
        projectId: ENV_PROJECT_ID,
    })

    // Edit the metadata to your preference
    web3wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: "Web3Wallet React Native Tutorial",
            description: "ReactNative Web3Wallet",
            url: "https://walletconnect.com/",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
    })
}

// Initialize the Web3Wallet
export default function useInitialization() {
    const [initialized, setInitialized] = useState(false)

    const onInitialize = useCallback(async () => {
        try {
            await createWeb3Wallet()
            setInitialized(true)
        } catch (err: unknown) {
            // console.log("Error for initializing", err)
        }
    }, [])

    useEffect(() => {
        if (!initialized) {
            onInitialize()
        }
    }, [initialized, onInitialize])

    const selectedAccount = useAppSelector(selectSelectedAccount)
    // console.log("selectedAccount", selectedAccount)

    currentETHAddress = selectedAccount?.address || ""

    return initialized
}

export async function web3WalletPair(params: { uri: string }) {
    return await web3wallet.core.pairing.pair({ uri: params.uri })
}
