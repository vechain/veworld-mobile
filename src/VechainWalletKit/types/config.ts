export interface VechainWalletSDKConfig {
    providerConfig: Record<string, unknown>
    networkConfig: NetworkConfig
}

export interface NetworkConfig {
    nodeUrl: string
    networkType: "mainnet" | "testnet"
}

export const getLast16BitsOfChainId = (networkType: "mainnet" | "testnet"): number => {
    // Mainnet chain ID is the geesis block id "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a"
    // Testnet chain ID is the geesis block id "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"
    // The smart account uses the last 16 bits of the chainId, so we convert it here
    if (networkType === "mainnet") {
        return 6986
    } else if (networkType === "testnet") {
        return 45351
    }
    throw new Error(`Unsupported network type: ${networkType}`)
}
