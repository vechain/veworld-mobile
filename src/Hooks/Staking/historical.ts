import { ThorClient } from "@vechain/sdk-network"
import { StargateDelegationEvents, StargateNftEvents } from "~Constants"
import { StargateConfiguration } from "~Hooks/useStargateConfig"
import { BigNutils } from "~Utils"
import ThorUtils from "~Utils/ThorUtils"

/**
 * Get the historical VTHO claimed by a user
 * @param thor Thor Client
 * @param nodeId Token ID of the Stargate Node
 * @param accountAddress Address of the selected account
 * @param nftContract SDK loaded contract for Stargate NFT
 * @param delegationContract SDK loaded contract for Stargate Delegation
 * @returns The historical VTHO Claimed by the user on that token id
 */
export const getHistoricalVTHOClaimed = async (
    thor: ThorClient,
    nodeId: string,
    accountAddress: string,
    config: StargateConfiguration,
) => {
    const logs = await ThorUtils.events.filterEventLogs(
        thor,
        {
            limit: 1000,
            offset: 0,
        },
        ThorUtils.events.getFilterCriteriaOfEvent(
            config.STARGATE_NFT_CONTRACT_ADDRESS!,
            [StargateNftEvents.BaseVTHORewardsClaimed],
            "BaseVTHORewardsClaimed",
            {
                owner: accountAddress,
                tokenId: BigInt(nodeId),
            },
        ),
        ThorUtils.events.getFilterCriteriaOfEvent(
            config.STARGATE_DELEGATION_CONTRACT_ADDRESS!,
            [StargateDelegationEvents.DelegationRewardsClaimed],
            "DelegationRewardsClaimed",
            {
                claimer: accountAddress,
                tokenId: BigInt(nodeId),
            },
        ),
    )

    return logs.reduce((acc, curr) => {
        if (curr.name === "BaseVTHORewardsClaimed") {
            // amount property
            acc.plus(curr.decodedData[2])
        } else if (curr.name === "DelegationRewardsClaimed") {
            // rewards property
            acc.plus(curr.decodedData[3])
        }
        return acc
    }, BigNutils("0"))
}
