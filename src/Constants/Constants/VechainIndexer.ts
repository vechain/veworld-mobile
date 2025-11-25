/* eslint-disable max-len */
import { NETWORK_TYPE } from "~Model"

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
