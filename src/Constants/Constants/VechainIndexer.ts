/* eslint-disable max-len */
import moment from "moment"
import { genesises } from "./Thor"
import { ActivityEvent, ActivitySearchBy, Network, NETWORK_TYPE } from "~Model"
import AddressUtils from "~Utils/AddressUtils"
import { ZERO_ADDRESS } from "@vechain/sdk-core"

const isMainGenesis = (thor: Connex.Thor) => thor.genesis.id === genesises.main.id

export enum ORDER {
    ASC = "ASC",
    DESC = "DESC",
}

/**
 * Get Contract addresses of NFTs owned by an address
 *
 * @param networkType - Mainnet or Testnet
 * @param ownerAddress - Address to get NFTs for
 * @param resultsPerPage - Number of results per page
 * @param page - Page number
 * @param direction - Direction of results
 *
 * @returns URL to fetch Contract addresses of NFTs owned by an address
 */
export const NFT_CONTRACTS_FOR_ADDRESS = (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
    direction: ORDER = ORDER.DESC,
) =>
    `${
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL
    }/nfts/contracts?owner=${ownerAddress}&size=${resultsPerPage}&page=${page}&direction=${direction}`

/**
 * Get NFTs owned given an NFT contract address
 *
 * @param networkType - Mainnet or Testnet
 * @param ownerAddress - Address to get NFTs for
 * @param contractAddress - NFT contract address
 * @param resultsPerPage - Number of results per page
 * @param page - Page number
 * @param direction - Direction of results
 *
 * @returns URL to fetch NFTs owned given an NFT contract address
 */
export const NFTS_OWNED_PER_CONTRACT = (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    contractAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
    direction: ORDER = ORDER.DESC,
) =>
    `${
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL
    }/nfts?address=${ownerAddress}&contractAddress=${contractAddress}&size=${resultsPerPage}&page=${page}&direction=${direction}`

/**
 * Get NFTs owned given an owner address
 *
 * @param networkType - Mainnet or Testnet
 * @param ownerAddress - Address to get NFTs for
 * @param resultsPerPage - Number of results per page
 * @param page - Page number
 * @param direction - Direction of results
 *
 * @returns URL to fetch NFTs owned given an owner address
 */
export const NFTS_OWNED_PER_OWNER = (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
    direction: ORDER = ORDER.DESC,
) =>
    `${
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL
    }/nfts?address=${ownerAddress}&size=${resultsPerPage}&page=${page}&direction=${direction}`

/**
 * Retrieve all activities associated with a specified address
 *
 * @param networkType - Mainnet or Testnet
 * @param address - Address to get transfers for
 * @param page - Page number
 * @param pageSize - Number of results per page
 * @param direction - Direction of results
 * @param eventName - Optional filter by specific transaction names
 * @param searchBy - Optional array of fields to search by
 * @param contractAddress - Optional contract address filter
 * @param before - Optional timestamp filter for transactions before this time
 * @param after - Optional timestamp filter for transactions after this time
 *
 * @returns URL to fetch all activities associated with a specified address
 */
export const getIndexedHistoryEventOrigin = ({
    networkType,
    address,
    page,
    pageSize = 20,
    direction = ORDER.DESC,
    eventName = [],
    searchBy = [],
    contractAddress = "",
    before = 0,
    after = 0,
}: {
    networkType: NETWORK_TYPE
    address: string
    page: number
    pageSize?: number
    direction?: ORDER
    eventName?: Readonly<ActivityEvent[]>
    searchBy?: ActivitySearchBy[]
    contractAddress?: string
    before?: number
    after?: number
}) => {
    const baseUrl =
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_V2_URL
            : process.env.REACT_APP_INDEXER_TESTNET_V2_URL

    let url = `${baseUrl}/history/${address}?page=${page}&size=${pageSize}&direction=${direction}`

    if (eventName.length > 0) {
        const uniqueEventNames = Array.from(new Set(eventName))
        url += `&eventName=${uniqueEventNames.join(",")}`
    }

    if (searchBy.length > 0) {
        const uniqueSearchBy = Array.from(new Set(searchBy))
        url += `&searchBy=${uniqueSearchBy.join(",")}`
    }

    if (contractAddress.length > 0 && !AddressUtils.compareAddresses(contractAddress, ZERO_ADDRESS)) {
        url += `&contractAddress=${contractAddress}`
    }

    if (before > 0 && moment(before).isValid()) {
        url += `&before=${before}`
    }

    if (after > 0 && moment(after).isValid()) {
        url += `&after=${after}`
    }

    return url
}

export const getTransactionOrigin = (txId: string, networkType: NETWORK_TYPE) => {
    const baseUrl =
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL

    return `${baseUrl}/transactions/${txId}?expanded=true`
}

/**
 * Get all transfers that have been performed given a specific block number
 *
 * @param blockNumber - Block number to get transfers for
 * @param addresses - Addresses to get transfers for
 * @param page - Page number
 * @param pageSize - Number of results per page
 * @param direction - Direction of results
 * @param networkType - Mainnet or Testnet
 *
 * @returns URL to fetch all transfers that have been performed inside a block given a specific block number
 */
export const getTransfersForBlock = (
    blockNumber: number,
    addresses: string[],
    page: number,
    pageSize: number,
    direction: ORDER,
    networkType: NETWORK_TYPE,
) => {
    return networkType === NETWORK_TYPE.MAIN
        ? `${
              process.env.REACT_APP_INDEXER_MAINNET_URL
          }/transfers/forBlock?blockNumber=${blockNumber}&addresses=${addresses.join(
              ",",
          )}&size=${pageSize}&page=${page}&direction=${direction}`
        : `${
              process.env.REACT_APP_INDEXER_TESTNET_URL
          }/transfers/forBlock?blockNumber=${blockNumber}&addresses=${addresses.join(
              ",",
          )}&size=${pageSize}&page=${page}&direction=${direction}`
}

export const getBlock = (thor: Connex.Thor, blockId: string) => {
    return isMainGenesis(thor)
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/blocks?revision=${blockId}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/blocks?revision=${blockId}`
}

export const getAppOverview = (appId: string) =>
    `${process.env.REACT_APP_INDEXER_MAINNET_URL}/b3tr/actions/apps/${appId}/overview`

/**
 * Get the contract addresses of fungible tokens owned by the given address
 *
 * @param thor - Connex.Thor instance to communicate with the blockchain
 * @param address - The address of origin or destination of the fungible tokens transfer events
 * @param officialTokensOnly - Whether to fetch only official tokens or not
 * @param page - The results page number
 * @param pageSize - The results page size
 * @param direction - The sort direction (DESC or ASC)
 */
export const getFungibleTokensContracts = (
    network: Network,
    address: string,
    officialTokensOnly: boolean,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return network.type === NETWORK_TYPE.MAIN
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transfers/fungible-tokens-contracts?address=${address}&officialTokensOnly=${officialTokensOnly}&size=${pageSize}&page=${page}&direction=${direction}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/transfers/fungible-tokens-contracts?address=${address}&officialTokensOnly=${officialTokensOnly}&size=${pageSize}&page=${page}&direction=${direction}`
}

/**
 * Get the global VeBetter actions overview
 * @returns Global VeBetter actions overview
 */
export const getVeBetterGlobalOverview = () => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/b3tr/actions/global/overview`
}

/**
 * Get the VeBetter general overview for a user
 * @param address Address of the user
 * @returns The general overview for a user
 */
export const getVeBetterUserGeneralOverview = (address: string) => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/b3tr/actions/users/${address}/overview`
}

/**
 * Get the VeBetter overview for a user in a timeframe
 * @param address Address of the user
 * @param fromDate Initial date (inclusive) in ISO String
 * @param toDate End date (inclusive) in ISO String
 * @returns The overview for a user for that timeframe
 */
export const getVeBetterUserOverview = (address: string, fromDate: string, toDate: string) => {
    const from = moment(fromDate).utc().format("YYYY-MM-DD")
    const to = moment(toDate).utc().format("YYYY-MM-DD")
    const params = new URLSearchParams()
    params.append("startDate", from)
    params.append("endDate", to)
    params.append("size", Math.ceil(moment(toDate).diff(fromDate, "day")).toString())
    return `${
        process.env.REACT_APP_INDEXER_MAINNET_URL
    }/b3tr/actions/users/${address}/daily-summaries?${params.toString()}`
}

/**
 * Get the VeBetter actions of a user
 * @param address Address of the user
 * @param param1 Options
 * @returns Return the VeBetter actions
 */
export const getVeBetterActions = (
    address: string,
    { page = 0, pageSize = 20 }: { page?: number; pageSize?: number } = {},
) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("size", pageSize.toString())
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/b3tr/actions/users/${address}?${params.toString()}`
}

/**
 * Get the total supply of Stargate NFTs
 * @returns The total supply of Stargate NFTs
 */
export const getStargateTotalSupply = () => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/stargate/nft-holders`
}

/**
 * Get the total VET staked in Stargate
 * @returns The total VET staked in Stargate
 */
export const getStargateTotalVetStaked = () => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/stargate/total-vet-staked`
}

/**
 * Get the total VTHO claimed in Stargate
 * @returns The total VTHO claimed in Stargate
 */
export const getStargateRewardsDistributed = () => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/stargate/total-vtho-claimed`
}

/**
 * Get VTHO claimed in Stargate for address
 * @param networkType Network type
 * @param address Address of the user
 * @param tokenId Stargate Token ID
 * @returns The VTHO claimed for address in Stargate
 */
export const getStargateVTHOClaimedByAddressAndTokenId = (
    networkType: NETWORK_TYPE,
    address: string,
    tokenId: string,
) => {
    return networkType === NETWORK_TYPE.MAIN
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/stargate/total-vtho-claimed/${address}/${tokenId}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/stargate/total-vtho-claimed/${address}/${tokenId}`
}

/**
 * Get Stargate tokens for address endpoint. (It does not include the baseUrl)
 * @param address Address of the user
 * @param param1 Options
 * @returns The Stargate tokens for address
 */
export const getStargateTokensByAddress = (
    address: string,
    { page = 0, pageSize = 50 }: { page?: number; pageSize?: number } = {},
) => {
    return `/api/v1/stargate/tokens?manager=${address}&owner=${address}&page=${page}&size=${pageSize}`
}
