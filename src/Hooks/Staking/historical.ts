import { Contract, ThorClient } from "@vechain/sdk-network"
import { StargateDelegationEvents, StargateNftEvents } from "~Constants"
import { AbiParametersToPrimitiveTypes } from "abitype"
import { AddressUtils, BigNutils } from "~Utils"

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
    nftContract: Contract<[typeof StargateNftEvents.BaseVTHORewardsClaimed]>,
    delegationContract: Contract<[typeof StargateDelegationEvents.DelegationRewardsClaimed]>,
) => {
    const nftCriteria = nftContract.criteria.BaseVTHORewardsClaimed({ owner: accountAddress, tokenId: BigInt(nodeId) })
    const delegationCriteria = delegationContract.criteria.DelegationRewardsClaimed({
        claimer: accountAddress,
        tokenId: BigInt(nodeId),
    })
    const filteredLogs = await thor.logs.filterEventLogs({
        criteriaSet: [nftCriteria, delegationCriteria],
        options: {
            limit: 1000,
            offset: 0,
        },
    })

    return filteredLogs.reduce((acc, curr) => {
        if (AddressUtils.compareAddresses(curr.address, nftContract.address)) {
            const data = curr.decodedData as AbiParametersToPrimitiveTypes<
                (typeof StargateNftEvents.BaseVTHORewardsClaimed)["inputs"]
            >
            //data[3] is the `amount` property
            acc.plus(data[2].toString())
        } else {
            const data = curr.decodedData as AbiParametersToPrimitiveTypes<
                (typeof StargateDelegationEvents.DelegationRewardsClaimed)["inputs"]
            >
            //data[3] is the `rewards` property
            acc.plus(data[3].toString())
        }
        return acc
    }, BigNutils("0"))
}
