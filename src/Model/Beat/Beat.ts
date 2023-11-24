/**
 * The beat object received at each wss message from the node
 * @param number - The block number
 * @param id - The block id
 * @param parentID - The parent block id
 * @param timestamp - The block timestamp
 * @param gasLimit - The block gas limit
 * @param bloom - The block bloom filter
 * @param k - The block bloom filter k value
 * @param txsFeatures - The block txs features
 * @param obsolete - Whether the block is obsolete
 */
export type Beat = {
    number: number
    id: string
    parentID: string
    timestamp: number
    gasLimit: number
    bloom: string
    k: number
    txsFeatures?: number
    obsolete: boolean
}
