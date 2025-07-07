export interface VechainWalletSDKConfig {
    providerConfig: Record<string, unknown>
    networkConfig: NetworkConfig
}

export interface NetworkConfig {
    networkType: "mainnet" | "testnet" | "solo"
    nodeUrl: string
    // optional chainId for solo networkType. Mainnet and testnet is handled by the Kit.
    chainId?: number
    // optional smart account factory address if you are using a solo network
    smartAccountFactoryAddress?: string
}
