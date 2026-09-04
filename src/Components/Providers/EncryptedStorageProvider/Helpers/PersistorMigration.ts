import type { Persistor } from "redux-persist"

type MigrationPersistor = Pick<Persistor, "flush" | "pause" | "persist">

/**
 * Flush and pause the persistor for the duration of the storage migration, so no
 * redux write can land in storage that is being read and pruned.
 *
 * On success the OLD persistor deliberately stays paused: the migration swaps the
 * redux storage (setReduxStorage), which rebuilds the store and a fresh, unpaused
 * persistor. A success path that does NOT swap storage would silently stop all
 * persistence — any new caller must uphold that invariant.
 */
export const runOnboardingStorageMigration = async (persistor: MigrationPersistor, migration: () => Promise<void>) => {
    await persistor.flush()
    persistor.pause()

    try {
        await migration()
    } catch (e) {
        persistor.persist()
        throw e
    }
}
