import {
    ERROR_EVENTS,
    getStargateRewardsDistributed,
    getStargateTotalSupply,
    getStargateTotalVetStaked,
    getStargateVTHOClaimedByAddressAndTokenId,
} from "~Constants"
import { NETWORK_TYPE } from "~Model"
import {
    fetchFromEndpoint,
    FetchStargateTotalSupplyResponse,
    FetchStargateTotalVetStakedResponse,
} from "~Networking/API"
import { debug } from "~Utils/Logger"

/**
 * Fetch the total supply of Stargate NFTs
 * @returns The total supply of Stargate NFTs
 */
export const fetchStargateTotalSupply = async () => {
    debug(ERROR_EVENTS.STARGATE, "Fetching Stargate total supply")

    try {
        return await fetchFromEndpoint<FetchStargateTotalSupplyResponse>(getStargateTotalSupply())
    } catch (error) {
        throw new Error(`Failed to fetch Stargate total supply: ${error}`)
    }
}

/**
 * Fetch the total VET staked in Stargate
 * @returns The total VET staked in Stargate
 */
export const fetchStargateTotalVetStaked = async () => {
    debug(ERROR_EVENTS.STARGATE, "Fetching Stargate total VET staked")

    try {
        return await fetchFromEndpoint<FetchStargateTotalVetStakedResponse>(getStargateTotalVetStaked())
    } catch (error) {
        throw new Error(`Failed to fetch Stargate total VET staked: ${error}`)
    }
}

/**
 * Fetch the total VTHO claimed in Stargate
 * @returns The total VTHO claimed in Stargate
 */
export const fetchStargateRewardsDistributed = async () => {
    debug(ERROR_EVENTS.STARGATE, "Fetching Stargate rewards distributed")

    try {
        return await fetchFromEndpoint<string>(getStargateRewardsDistributed())
    } catch (error) {
        throw new Error(`Failed to fetch Stargate rewards distributed: ${error}`)
    }
}

export const fetchStargateVthoClaimed = async (networkType: NETWORK_TYPE, address: string, tokenId: string) => {
    debug(ERROR_EVENTS.STARGATE, `Fetching Stargate VTHO claimed for Address: ${address}, TokenID: ${tokenId}`)

    try {
        return await fetchFromEndpoint<string>(getStargateVTHOClaimedByAddressAndTokenId(networkType, address, tokenId))
    } catch (error) {
        throw new Error(
            `Failed to fetch Stargate vtho claimed for Address: ${address}, TokenID: ${tokenId}. Error ${error}`,
        )
    }
}
