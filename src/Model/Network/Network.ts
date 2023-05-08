import { genesises } from "~Common/Constant/Thor/ThorConstants"
import { NETWORK_TYPE } from "./enums"

/**
 * A model for the VechainThor network that we are connected to
 * @field `id` - Unique ID for this network
 * @field `defaultNet` - If the network is a default network
 * @field `name` - A name for this network
 * @field `type` - What type of network is it? `main, test, solo or custom`
 * @field `url` - Base URL for the VeThor node
 * @field `genesis` - The genesis block for the Blockchain
 */
export type Network = {
    id: string
    defaultNet: boolean
    name: string
    type: NETWORK_TYPE
    currentUrl: string
    urls: string[]
    explorerUrl?: string
    genesis: typeof genesises.main
}
