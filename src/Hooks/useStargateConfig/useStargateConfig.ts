import { useMemo } from "react"
import { useFeatureFlags } from "~Components"
import { useIsHayabusa } from "~Hooks/useIsHayabusa"
import { Network } from "~Model"

export type StargateConfiguration = {
    STARGATE_NFT_CONTRACT_ADDRESS?: string
    NODE_MANAGEMENT_CONTRACT_ADDRESS?: string
    LEGACY_NODES_CONTRACT_ADDRESS?: string
    STARGATE_DELEGATION_CONTRACT_ADDRESS?: string
    /**
     * Stargate contract address (valid only after Hayabusa)
     */
    STARGATE_CONTRACT_ADDRESS?: string
}

const stargateNetworkConfig: Record<string, StargateConfiguration> = {
    //Mainnet
    "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a": {
        STARGATE_NFT_CONTRACT_ADDRESS: "0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7",
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB",
        LEGACY_NODES_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302",
        STARGATE_DELEGATION_CONTRACT_ADDRESS: "0x4cb1c9ef05b529c093371264fab2c93cc6cddb0e",
    },
    //Testnet
    "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127": {
        STARGATE_NFT_CONTRACT_ADDRESS: "0x887d9102f0003f1724d8fd5d4fe95a11572fcd77",
        NODE_MANAGEMENT_CONTRACT_ADDRESS: "0x8bcbfc20ee39c94f4e60afc5d78c402f70b4f3b2",
        LEGACY_NODES_CONTRACT_ADDRESS: "0x0747b39abc0de3d11c8ddfe2e7eed00aaa8d475c",
        STARGATE_DELEGATION_CONTRACT_ADDRESS: "0x7240e3bc0d26431512d5b67dbd26d199205bffe8",
    },
}

export const useStargateConfig = (network: Network) => {
    const isHayabusa = useIsHayabusa(network)
    const featureFlags = useFeatureFlags()

    return useMemo(() => {
        if (!featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]) return {}
        return {
            ...stargateNetworkConfig[network.genesis.id],
            ...(isHayabusa && {
                STARGATE_CONTRACT_ADDRESS:
                    featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]?.contract ??
                    stargateNetworkConfig[network.genesis.id]?.STARGATE_CONTRACT_ADDRESS,
                STARGATE_NFT_CONTRACT_ADDRESS:
                    featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]?.nft ??
                    stargateNetworkConfig[network.genesis.id]?.STARGATE_NFT_CONTRACT_ADDRESS,
                NODE_MANAGEMENT_CONTRACT_ADDRESS:
                    featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]?.nodeManagement ??
                    stargateNetworkConfig[network.genesis.id]?.NODE_MANAGEMENT_CONTRACT_ADDRESS,
                STARGATE_DELEGATION_CONTRACT_ADDRESS:
                    featureFlags?.forks?.HAYABUSA?.stargate?.[network.genesis.id]?.delegation ??
                    stargateNetworkConfig[network.genesis.id]?.STARGATE_DELEGATION_CONTRACT_ADDRESS,
            }),
        }
    }, [featureFlags?.forks?.HAYABUSA?.stargate, isHayabusa, network.genesis.id])
}
