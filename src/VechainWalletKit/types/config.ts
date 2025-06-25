export interface VechainWalletSDKConfig {
    provider: "privy" | "custom"
    providerConfig: {
        appId: string
        clientId: string
        [key: string]: unknown
    }
    networkConfig: NetworkConfig
}

export interface NetworkConfig {
    chainId: number
    nodeUrl: string
    networkType: string
    name: string
}
