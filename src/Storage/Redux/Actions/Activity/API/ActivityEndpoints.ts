export enum ORDER {
    ASC = "ASC",
    DESC = "DESC",
}

export const getTransactionsOrigin = (
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transactions?origin=${address}&size=${pageSize}&page=${page}&direction=${direction}`
}

export const getIncomingTransfersOrigin = (
    address: string,
    page: number,
    pageSize: number,
    direction: ORDER,
) => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/transfers/to?address=${address}&size=${pageSize}&page=${page}&direction=${direction}`
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

export const getBlock = (blockId: string) => {
    return `${process.env.REACT_APP_INDEXER_MAINNET_URL}/blocks?revision=${blockId}`
}
