import { ImageCacheState, RootState } from "../Types"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"

export const selectImageCacheState = (state: RootState) => state.imageCache

export const selectEntryFromImageCache = (
    state: ImageCacheState,
    seed: string,
) => {
    return state.cache[createKey(seed)]
}
