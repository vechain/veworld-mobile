const BASE_URL = "https://veworld.eu.ngrok.io/api/v1"

export const NFT_CONTRACTS_FOR_ADDRESS = (ownerAddress: string) =>
    `${BASE_URL}/nfts/contracts?owner=${ownerAddress}&size=20&page=0&direction=ASC`

export const NFTS_OWNED_PER_CONTRACT = (
    ownerAddress: string,
    contractAddress: string,
    resultsPerPage: number = 20,
    page: number = 0,
) =>
    `${BASE_URL}/nfts?address=${ownerAddress}&contractAddress=${contractAddress}&size=${resultsPerPage}&page=${page}&direction=ASC`
