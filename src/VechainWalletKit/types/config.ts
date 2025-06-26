export interface VechainWalletSDKConfig {
    providerConfig: Record<string, unknown>
    networkConfig: NetworkConfig
}

export interface NetworkConfig {
    chainId: number
    nodeUrl: string
    networkType: string
    name: string
}
