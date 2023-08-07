import { MetadataCacheState, RootState } from "../Types"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"

export const selectMetadataCacheState = (state: RootState) =>
    state.metadataCache

export const selectEntryFromMetadataCache = (
    state: MetadataCacheState,
    seed: string,
) => {
    return state.cache[createKey(seed)]
}
