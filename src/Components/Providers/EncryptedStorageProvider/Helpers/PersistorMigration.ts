import type { Persistor } from "redux-persist"

type MigrationPersistor = Pick<Persistor, "flush" | "pause" | "persist">

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
