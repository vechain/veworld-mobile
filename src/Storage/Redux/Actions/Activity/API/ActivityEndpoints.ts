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
    return `${process.env.REACT_APP_INDEXER_URL}/transactions?origin=${address}&size=${pageSize}&page=${page}&direction=${direction}`
}

export const getBlock = (blockId: string) => {
    return `${process.env.REACT_APP_INDEXER_URL}/blocks?revision=${blockId}`
}
