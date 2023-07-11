import { genesises } from "~Constants"
import { NETWORK_TYPE } from "~Model"

const isMainnet = (thor: Connex.Thor) => thor.genesis.id === genesises.main.id

export const NFT_CONTRACTS_FOR_ADDRESS = (
    networkType: string,
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) =>
    `${
        networkType === NETWORK_TYPE.MAIN
            ? process.env.REACT_APP_INDEXER_MAINNET_URL
            : process.env.REACT_APP_INDEXER_TESTNET_URL
    }/nfts/contracts?owner=${ownerAddress}&size=${resultsPerPage}&page=${page}&direction=ASC`

export const NFTS_OWNED_PER_CONTRACT = (
    networkType: string,
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

export enum ORDER {
    ASC = "ASC",
    DESC = "DESC",
}

export const getTransactionsOrigin = (
    thor: Connex.Thor,
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return isMainnet(thor)
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transactions?origin=${address}&size=${pageSize}&page=${page}&direction=${direction}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/transactions?origin=${address}&size=${pageSize}&page=${page}&direction=${direction}`
}

export const getIncomingTransfersOrigin = (
    thor: Connex.Thor,
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return isMainnet(thor)
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transfers/to?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/transfers/to?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
}

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
