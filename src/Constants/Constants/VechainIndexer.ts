import { NETWORK_TYPE } from "~Model"

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
