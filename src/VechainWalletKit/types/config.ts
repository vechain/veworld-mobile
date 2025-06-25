export interface VechainWalletSDKConfig {
    provider: "privy" | "custom"
    network: "mainnet" | "testnet"
    providerConfig: {
        appId: string
        clientId: string
        [key: string]: unknown
    }
    networkConfig: NetworkConfig
}

export interface NetworkConfig {
    chainId: number
    chainTag: number
    nodeUrl: string
    network: string
    name: string
}
