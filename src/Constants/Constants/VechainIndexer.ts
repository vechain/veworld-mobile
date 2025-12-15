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
