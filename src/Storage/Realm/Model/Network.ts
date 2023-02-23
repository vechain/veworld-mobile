import { index, Object } from "realm"
import { NETWORK_TYPE } from "~Model/Network"

export class Network extends Object<Network, "id"> {
    @index
    id!: string

    defaultNet!: boolean
    name!: string
    type!: NETWORK_TYPE
    currentUrl!: string
    url!: string
    genesis!: Connex.Thor.Block

    static primaryKey = "id"
}
