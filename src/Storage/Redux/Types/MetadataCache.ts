import { TokenMetadata } from "~Model"

export interface MetadataCacheState {
    cache: { [key: string]: TokenMetadata }
}

export interface MetadataCacheEntry {
    seed: string
    value: TokenMetadata
}
