import { ERROR_EVENTS, getVeBetterUserGeneralOverview, getVeBetterUserOverview } from "~Constants"
import {
    fetchFromEndpoint,
    FetchVeBetterUserGeneralOverviewResponse,
    FetchVeBetterUserOverviewResponseItem,
} from "~Networking/API"
import { PaginationResponse } from "~Networking/NFT"
import { debug } from "~Utils"

/**
 * Get the VeBetter general overview for a user
 * @param address Address of the user
 * @returns The general overview for a user
 */
export const fetchVeBetterUserGeneralOverview = async (address: string) => {
    debug(ERROR_EVENTS.VEBETTER, `Fetching VeBetter user general overview for ${address}`)

    try {
        return await fetchFromEndpoint<FetchVeBetterUserGeneralOverviewResponse>(
            getVeBetterUserGeneralOverview(address),
        )
    } catch (error) {
        throw new Error(`Failed to fetch VeBetter user general overview: ${error}`)
    }
}

/**
 * Get the VeBetter overview for a user in a timeframe
 * @param address Address of the user
 * @param fromDate Initial date (inclusive).
 * @param toDate End date (inclusive).
 * @returns The overview for a user for that timeframe
 */
export const fetchVeBetterUserOverview = async (address: string, fromDate: string, toDate: string) => {
    debug(
        ERROR_EVENTS.VEBETTER,
        `Fetching VeBetter user overview for ${address}. From date ${fromDate} to date ${toDate}`,
    )

    try {
        return await fetchFromEndpoint<{
            data: FetchVeBetterUserOverviewResponseItem[]
            pagination: PaginationResponse
        }>(getVeBetterUserOverview(address, fromDate, toDate))
    } catch (error) {
        throw new Error(`Failed to fetch VeBetter user overview: ${error}`)
    }
}
