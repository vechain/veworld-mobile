import { NETWORK_TYPE } from "~Model"
import { ethers } from "ethers"

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

// Stargate delegation contract
const VTHORewardPerBlockPerNFTLevel = {
    mainnet: [
        {
            levelId: 1,
            rewardPerBlock: ethers.utils.parseUnits("0.122399797", 18), // 0.122399797 * 10^18
        },
        {
            levelId: 2,
            rewardPerBlock: ethers.utils.parseUnits("0.975076104", 18), // 0.975076104 * 10^18
        },
        {
            levelId: 3,
            rewardPerBlock: ethers.utils.parseUnits("3.900304414", 18), // 3.900304414 * 10^18
        },
        {
            levelId: 4,
            rewardPerBlock: ethers.utils.parseUnits("0.076674277", 18), // 0.076674277 * 10^18
        },
        {
            levelId: 5,
            rewardPerBlock: ethers.utils.parseUnits("0.313546423", 18), // 0.313546423 * 10^18
        },
        {
            levelId: 6,
            rewardPerBlock: ethers.utils.parseUnits("1.365550482", 18), // 1.365550482 * 10^18
        },
        {
            levelId: 7,
            rewardPerBlock: ethers.utils.parseUnits("4.872526636", 18), // 4.872526636 * 10^18
        },
        // nft
        {
            levelId: 8,
            rewardPerBlock: ethers.utils.parseUnits("0.000697615", 18), // 0.000697615 * 10^18
        },
        {
            levelId: 9,
            rewardPerBlock: ethers.utils.parseUnits("0.003900304", 18), // 0.003900304 * 10^18
        },
        {
            levelId: 10,
            rewardPerBlock: ethers.utils.parseUnits("0.018074581", 18), // 0.018074581 * 10^18
        },
    ],
    testnet: [
        {
            levelId: 1,
            rewardPerBlock: ethers.utils.parseUnits("0.000122399", 18),
        },
        {
            levelId: 2,
            rewardPerBlock: ethers.utils.parseUnits("0.000975076", 18),
        },
        {
            levelId: 3,
            rewardPerBlock: ethers.utils.parseUnits("0.000390030", 18),
        },
        {
            levelId: 4,
            rewardPerBlock: ethers.utils.parseUnits("0.000766742", 18),
        },
        {
            levelId: 5,
            rewardPerBlock: ethers.utils.parseUnits("0.000313546", 18),
        },
        {
            levelId: 6,
            rewardPerBlock: ethers.utils.parseUnits("0.000136555", 18),
        },
        {
            levelId: 7,
            rewardPerBlock: ethers.utils.parseUnits("0.000487252", 18),
        },
        // nft
        {
            levelId: 8,
            rewardPerBlock: ethers.utils.parseUnits("0.000697615", 18),
        },
        {
            levelId: 9,
            rewardPerBlock: ethers.utils.parseUnits("0.000390030", 18),
        },
        {
            levelId: 10,
            rewardPerBlock: ethers.utils.parseUnits("0.000180745", 18),
        },
    ],
    other: [],
    solo: [],
}

export const getVTHORewardPerBlockPerNFTLevel = (network: NETWORK_TYPE) => VTHORewardPerBlockPerNFTLevel[network]
