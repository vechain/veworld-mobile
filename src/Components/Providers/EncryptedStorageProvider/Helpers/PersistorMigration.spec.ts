import { runOnboardingStorageMigration } from "./PersistorMigration"

describe("runOnboardingStorageMigration", () => {
    it("flushes pending wallet state before pausing and migrating", async () => {
        const calls: string[] = []
        let releaseFlush!: () => void
        const flush = jest.fn(
            () =>
                new Promise<void>(resolve => {
                    releaseFlush = () => {
                        calls.push("flush")
                        resolve()
                    }
                }),
        )
        const pause = jest.fn(() => calls.push("pause"))
        const persist = jest.fn()
        const migration = jest.fn(async () => {
            calls.push("migration")
        })

        const result = runOnboardingStorageMigration({ flush, pause, persist }, migration)
        expect(pause).not.toHaveBeenCalled()
        expect(migration).not.toHaveBeenCalled()

        releaseFlush()
        await result

        expect(calls).toEqual(["flush", "pause", "migration"])
        expect(persist).not.toHaveBeenCalled()
    })

    it("resumes onboarding persistence when migration fails", async () => {
        const persistor = {
            flush: jest.fn().mockResolvedValue(undefined),
            pause: jest.fn(),
            persist: jest.fn(),
        }
        const failure = new Error("migration failed")

        await expect(
            runOnboardingStorageMigration(persistor, async () => {
                throw failure
            }),
        ).rejects.toBe(failure)

        expect(persistor.persist).toHaveBeenCalledTimes(1)
    })
})
