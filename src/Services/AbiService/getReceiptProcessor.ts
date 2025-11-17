import { NETWORK_TYPE } from "~Model"
import { BusinessEventAbiManager } from "./BusinessEventAbiManager"
import { GenericAbiManager } from "./GenericAbiManager"
import { NativeAbiManager } from "./NativeAbiManager"
import { ReceiptProcessor } from "./ReceiptProcessor"

const nativeAbiManager = new NativeAbiManager()
const genericAbiManager = new GenericAbiManager()
const businessEventManagers = {
    [NETWORK_TYPE.MAIN]: new BusinessEventAbiManager(NETWORK_TYPE.MAIN, {
        B3TR_CONTRACT: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        VOT3_CONTRACT: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
        B3TR_GOVERNOR_CONTRACT: "0x1c65c25fabe2fc1bcb82f253fa0c916a322f777c",
        GM_NFT_CONTRACT: "0x93b8cd34a7fc4f53271b9011161f7a2b5fea9d1f",
        X_ALLOC_VOTING_CONTRACT: "0x89a00bb0947a30ff95beef77a66aede3842fe5b7",
        X2EARN_REWARDS_POOL_CONTRACT: "0x6bee7ddab6c99d5b2af0554eaea484ce18f52631",
        VOTER_REWARDS_CONTRACT: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
        TREASURY_CONTRACT: "0xd5903bcc66e439c753e525f8af2fec7be2429593",
        STARGATE_DELEGATION_CONTRACT: "0x4cb1c9ef05b529c093371264fab2c93cc6cddb0e",
        STARGATE_NFT_CONTRACT: "0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7",
        VEVOTE_CONTRACT: "0x7d812e8e544bb0c7898ea656b70173e7ef426b4c",
    }),
    [NETWORK_TYPE.TEST]: new BusinessEventAbiManager(NETWORK_TYPE.TEST, {
        B3TR_CONTRACT: "0xbf64cf86894ee0877c4e7d03936e35ee8d8b864f",
        VOT3_CONTRACT: "0xa704c45971995467696ee9544da77dd42bc9706e",
        B3TR_GOVERNOR_CONTRACT: "0xdf5e114d391cac840529802fe8d01f6bdebe41ec",
        GM_NFT_CONTRACT: "0xcf73039913e05aa1838d5869e72290d2b454c1e8",
        X_ALLOC_VOTING_CONTRACT: "0x5859ff910d8b0c127364c98e24233b0af7443c1c",
        X2EARN_REWARDS_POOL_CONTRACT: "0x5f8f86b8d0fa93cdae20936d150175df0205fb38",
        VOTER_REWARDS_CONTRACT: "0x2e47fc4aabb3403037fb5e1f38995e7a91ce8ed2",
        TREASURY_CONTRACT: "0x039893ebe092a2d22b08e2b029735d211bff7f50",
        STARGATE_DELEGATION_CONTRACT: "0x7240e3bc0d26431512d5b67dbd26d199205bffe8",
        STARGATE_NFT_CONTRACT: "0x887d9102f0003f1724d8fd5d4fe95a11572fcd77",
        VEVOTE_CONTRACT: "0xe1ecc51fc02c29e54b428279c0456010fda5c4f2",
        STARGATE_CONTRACT: "0x1e02b2953adefec225cf0ec49805b1146a4429c1",
    }),
    [NETWORK_TYPE.SOLO]: new BusinessEventAbiManager(NETWORK_TYPE.SOLO, {}),
    [NETWORK_TYPE.OTHER]: new BusinessEventAbiManager(NETWORK_TYPE.OTHER, {}),
}

nativeAbiManager.loadAbis()
genericAbiManager.loadAbis()
Object.values(businessEventManagers).forEach(manager => manager.loadAbis())

export const getReceiptProcessor = (
    network: NETWORK_TYPE,
    includedManagers: ("Generic" | "BusinessEvent" | "Native")[] = ["Generic", "Native", "BusinessEvent"],
) => {
    const genericManager = includedManagers.includes("Generic") ? genericAbiManager : undefined
    const nativeManager = includedManagers.includes("Native") ? nativeAbiManager : undefined
    const businessEventManager = includedManagers.includes("BusinessEvent") ? businessEventManagers[network] : undefined

    const managers = [genericManager, nativeManager, businessEventManager].filter(
        (u): u is NonNullable<typeof u> => u !== undefined,
    )

    return new ReceiptProcessor(managers)
}
