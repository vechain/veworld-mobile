import { NETWORK_TYPE } from "~Model"
import { ethers } from "ethers"

/**
 * Contract of the blockchain Staker contract address.
 * The address is shared between testnet and mainnet
 */
export const STAKER_CONTRACT_ADDRESS = "0x00000000000000000000000000005374616b6572"

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
