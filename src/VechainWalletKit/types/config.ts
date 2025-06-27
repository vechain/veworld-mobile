export interface VechainWalletSDKConfig {
    providerConfig: Record<string, unknown>
    networkConfig: NetworkConfig
}

export interface NetworkConfig {
    networkType: "mainnet" | "testnet"
    nodeUrl: string
}
