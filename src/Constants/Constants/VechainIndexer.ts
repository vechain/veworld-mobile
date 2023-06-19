export const NFT_CONTRACTS_FOR_ADDRESS = (
    ownerAddress: string,
    resultsPerPage: number,
    page: number,
) =>
    `${process.env.REACT_APP_INDEXER_URL}/nfts/contracts?owner=${ownerAddress}&size=${resultsPerPage}&page=${page}&direction=ASC`

export const NFTS_OWNED_PER_CONTRACT = (
    ownerAddress: string,
    contractAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
) =>
    `${process.env.REACT_APP_INDEXER_URL}/nfts?address=${ownerAddress}&contractAddress=${contractAddress}&size=${resultsPerPage}&page=${page}&direction=ASC`
