import { genesises } from "~Constants"
import { NETWORK_TYPE, Network } from "~Model"

const isMainnet = (thor: Connex.Thor) => thor.genesis.id === genesises.main.id

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
 *
 * @returns URL to fetch Contract addresses of NFTs owned by an address
 */
export const NFT_CONTRACTS_FOR_ADDRESS = (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) =>
    `${
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL
    }/nfts/contracts?owner=${ownerAddress}&size=${resultsPerPage}&page=${page}&direction=ASC`

/**
 * Get NFTs owned given an NFT contract address
 *
 * @param networkType - Mainnet or Testnet
 * @param ownerAddress - Address to get NFTs for
 * @param contractAddress - NFT contract address
 * @param resultsPerPage - Number of results per page
 * @param page - Page number
 *
 * @returns URL to fetch NFTs owned given an NFT contract address
 */
export const NFTS_OWNED_PER_CONTRACT = (
    networkType: NETWORK_TYPE,
    ownerAddress: string,
    contractAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
) =>
    `${
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL
    }/nfts?address=${ownerAddress}&contractAddress=${contractAddress}&size=${resultsPerPage}&page=${page}&direction=ASC`

/**
 * Get all transactions performed by a given address
 *
 * @param networkType - Mainnet or Testnet
 * @param address - Address to get transactions for
 * @param page - Page number
 * @param pageSize - Number of results per page
 * @param direction - Direction of results
 *
 * @returns URL to fetch all transactions performed by a given address
 */
export const getTransactionsOrigin = (
    networkType: NETWORK_TYPE,
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return networkType === NETWORK_TYPE.MAIN
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transactions?origin=${address}&size=${pageSize}&page=${page}&direction=${direction}&expanded=true`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/transactions?origin=${address}&size=${pageSize}&page=${page}&direction=${direction}&expanded=true`
}

/**
 * Get all transfers a given address has received
 *
 * @param networkType - Mainnet or Testnet
 * @param address - Address to get transfers for
 * @param page - Page number
 * @param pageSize - Number of results per page
 * @param direction - Direction of results
 *
 * @returns URL to fetch all transfers a given address has received
 */
export const getIncomingTransfersOrigin = (
    networkType: NETWORK_TYPE,
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return networkType === NETWORK_TYPE.MAIN
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transfers/to?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/transfers/to?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
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
    return isMainnet(thor)
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/blocks?revision=${blockId}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/blocks?revision=${blockId}`
}

/**
 * Get the contract addresses of fungible tokens owned by the given address
 *
 * @param thor - Connex.Thor instance to communicate with the blockchain
 * @param address - The address of origin or destination of the fungible tokens transfer events
 * @param page - The results page number
 * @param pageSize - The results page size
 * @param direction - The sort direction (DESC or ASC)
 */
export const getFungibleTokensContracts = (
    network: Network,
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return network.type === NETWORK_TYPE.MAIN
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transfers/fungible-tokens-contracts?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/transfers/fungible-tokens-contracts?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
}
