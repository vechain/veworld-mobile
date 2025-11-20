import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { BusinessEventAbiManager } from "~Services/AbiService/BusinessEventAbiManager"
import { GenericAbiManager } from "~Services/AbiService/GenericAbiManager"
import { NativeAbiManager } from "~Services/AbiService/NativeAbiManager"
import { ReceiptProcessor } from "~Services/AbiService/ReceiptProcessor"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

const nativeAbiManager = new NativeAbiManager()
const genericAbiManager = new GenericAbiManager()
nativeAbiManager.loadAbis()
genericAbiManager.loadAbis()

type ReceiptProcessorCallback = (includedManagers?: ("Generic" | "BusinessEvent" | "Native")[]) => ReceiptProcessor

const ReceiptProcessorContext = createContext<ReceiptProcessorCallback>(
    () => new ReceiptProcessor([nativeAbiManager, genericAbiManager]),
)

const BASE_CONFIGS = {
    [defaultMainNetwork.genesis.id]: {
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
    },
    [defaultTestNetwork.genesis.id]: {
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
    },
}

export const ReceiptProcessorProvider = ({ children }: PropsWithChildren) => {
    const network = useAppSelector(selectSelectedNetwork)
    const config = useStargateConfig(network)

    const businessEventManager = useMemo(() => {
        const manager = new BusinessEventAbiManager(network.type, {
            ...BASE_CONFIGS[network.genesis.id],
            ...(config.STARGATE_CONTRACT_ADDRESS && { STARGATE_CONTRACT: config.STARGATE_CONTRACT_ADDRESS }),
            ...(config.STARGATE_NFT_CONTRACT_ADDRESS && {
                STARGATE_NFT_CONTRACT: config.STARGATE_NFT_CONTRACT_ADDRESS,
            }),
            ...(config.STARGATE_DELEGATION_CONTRACT_ADDRESS && {
                STARGATE_DELEGATION_CONTRACT: config.STARGATE_DELEGATION_CONTRACT_ADDRESS,
            }),
        })
        manager.loadAbis()
        return manager
    }, [
        config.STARGATE_CONTRACT_ADDRESS,
        config.STARGATE_DELEGATION_CONTRACT_ADDRESS,
        config.STARGATE_NFT_CONTRACT_ADDRESS,
        network.genesis.id,
        network.type,
    ])

    const getReceiptProcessor = useCallback<ReceiptProcessorCallback>(
        (includedManagers = ["Generic", "Native", "BusinessEvent"]) => {
            const genericManager = includedManagers.includes("Generic") ? genericAbiManager : undefined
            const nativeManager = includedManagers.includes("Native") ? nativeAbiManager : undefined
            const _businessEventManager = includedManagers.includes("BusinessEvent") ? businessEventManager : undefined

            const managers = [genericManager, nativeManager, _businessEventManager].filter(
                (u): u is NonNullable<typeof u> => u !== undefined,
            )

            return new ReceiptProcessor(managers)
        },
        [businessEventManager],
    )

    return <ReceiptProcessorContext.Provider value={getReceiptProcessor}>{children}</ReceiptProcessorContext.Provider>
}

export const useReceiptProcessor = () => {
    return useContext(ReceiptProcessorContext)
}

/**
 * Get the receipt processor for the current network with all the managers enabled
 * @returns The receipt processor for the current network with all the managers enabled
 */
export const useCompleteReceiptProcessor = () => {
    const getReceiptProcessor = useReceiptProcessor()
    return useMemo(() => getReceiptProcessor(), [getReceiptProcessor])
}
