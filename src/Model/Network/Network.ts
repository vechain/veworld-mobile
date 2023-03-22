import { NETWORK_TYPE } from "./enums"

export interface INetwork {
    defaultNet: boolean
    nodeId: string
    tag: string
    type: NETWORK_TYPE
    currentUrl: string
    urls: string[]
    genesisId: string
}
