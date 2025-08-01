import { NETWORK_TYPE } from "~Model"

export const stargateNetworkConfig: Record<
    NETWORK_TYPE,
    {
        [key: string]: string
    }
> = {
    mainnet: {
        STARGATE_NFT_CONTRACT_ADDRESS: "0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7",
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB",
        LEGACY_NODES_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302",
        STARGATE_DELEGATION_CONTRACT_ADDRESS: "0x4cb1c9ef05b529c093371264fab2c93cc6cddb0e",
    },
    testnet: {
        STARGATE_NFT_CONTRACT_ADDRESS: "0x1ec1d168574603ec35b9d229843b7c2b44bcb770",
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0x8bcbfc20ee39c94f4e60afc5d78c402f70b4f3b2",
        LEGACY_NODES_CONTRACT_ADDRESS: "0x0747b39abc0de3d11c8ddfe2e7eed00aaa8d475c",
        STARGATE_DELEGATION_CONTRACT_ADDRESS: "0x7240e3bc0d26431512d5b67dbd26d199205bffe8",
    },
    other: {},
    solo: {},
}

export const getStargateNetworkConfig = (network: NETWORK_TYPE) => stargateNetworkConfig[network]
