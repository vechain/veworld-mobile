import { ERROR_EVENTS, getAppOverview } from "~Constants"
import { FetchAppOverviewResponse, fetchFromEndpoint } from "~Networking"
import { debug } from "~Utils"

/**
 * Fetches the app overview for a given app id.
 *
 * @param {string} appId - The app id to fetch the overview for.
 *
 * @returns {Promise<FetchAppOverviewResponse>} A promise that resolves to the app overview infos.
 *
 * @throws Will throw an error if the network request fails.
 */
export const fetchAppOverview = async (appId: string): Promise<FetchAppOverviewResponse> => {
    debug(ERROR_EVENTS.TOKENS, `Fetching app overview for ${appId}`)
    try {
        return await fetchFromEndpoint<FetchAppOverviewResponse>(getAppOverview(appId))
    } catch (error) {
        throw new Error(`Failed to fetch transfers: ${error}`)
    }
}
