export interface ImageCacheState {
    cache: { [key: string]: string }
}

export interface ImageCacheEntry {
    seed: string
    value: string
}
