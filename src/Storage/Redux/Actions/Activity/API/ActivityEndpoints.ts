import { genesises } from "~Constants"

const isMainnet = (thor: Connex.Thor) => thor.genesis.id === genesises.main.id

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
) => {
    return `${
        process.env.REACT_APP_INDEXER_MAINNET_URL
    }/transfers/forBlock?blockNumber=${blockNumber}&addresses=${addresses.join(
        ",",
    )}&size=${pageSize}&page=${page}&direction=${direction}`
}

export const getBlock = (thor: Connex.Thor, blockId: string) => {
    return isMainnet(thor)
        ? `${process.env.REACT_APP_INDEXER_MAINNET_URL}/blocks?revision=${blockId}`
        : `${process.env.REACT_APP_INDEXER_TESTNET_URL}/blocks?revision=${blockId}`
}
