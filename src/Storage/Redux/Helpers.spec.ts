import { MMKV } from "react-native-mmkv"
import { PersistedState } from "redux-persist/es/types"
import { getPersistorConfig } from "./Helpers"

jest.mock("./Migrations", () => ({
    migrationUpdates: {
        38: (state: PersistedState) => {
            if (process.env.HELPERS_SPEC_THROWING_MIGRATION === "true") {
                throw new Error("migration boom")
            }
            return state
        },
    },
}))

const ENCRYPTION_KEY = "a".repeat(64)

const persistedStateAtVersion = (version: number) =>
    ({ _persist: { version, rehydrated: false } } as unknown as PersistedState)

/** Resolves "sealed" if `promise` has not settled within 50ms. */
const settledOrSealed = (promise: Promise<unknown>) =>
    Promise.race([
        promise.then(
            () => "settled",
            () => "rejected",
        ),
        new Promise(resolve => setTimeout(() => resolve("sealed"), 50)),
    ])

describe("getPersistorConfig", () => {
    beforeEach(() => {
        process.env.HELPERS_SPEC_THROWING_MIGRATION = "false"
    })

    it("disables the rehydration timeout — the seal relies on it", async () => {
        const config = await getPersistorConfig(new MMKV({ id: "helpers-spec" }), ENCRYPTION_KEY)

        // Load-bearing: with the default timeout (5000ms) redux-persist rehydrates
        // undefined after 5s, staging reducer defaults for writing over the encrypted
        // state. Removing `timeout: 0` silently reintroduces that data-loss bug.
        expect(config.timeout).toBe(0)
    })

    it("runs migrations normally when none of them throw", async () => {
        const onRehydrationError = jest.fn()
        const config = await getPersistorConfig(new MMKV({ id: "helpers-spec" }), ENCRYPTION_KEY, onRehydrationError)

        const state = persistedStateAtVersion(37)
        const migrated = await config.migrate?.(state, 38)

        expect(migrated).toEqual(state)
        expect(onRehydrationError).not.toHaveBeenCalled()
    })

    it("seals the persistor when a migration throws instead of rehydrating defaults", async () => {
        process.env.HELPERS_SPEC_THROWING_MIGRATION = "true"
        const onRehydrationError = jest.fn()
        const config = await getPersistorConfig(new MMKV({ id: "helpers-spec" }), ENCRYPTION_KEY, onRehydrationError)

        const result = config.migrate?.(persistedStateAtVersion(37), 38) as Promise<unknown>

        // The returned promise must never settle: settling with undefined would mark the
        // store rehydrated with reducer defaults and stage them for writing.
        await expect(settledOrSealed(result)).resolves.toBe("sealed")
        expect(onRehydrationError).toHaveBeenCalledTimes(1)
    })

    it("seals the persistor when the stored state cannot be read", async () => {
        const onRehydrationError = jest.fn()
        const config = await getPersistorConfig(new MMKV({ id: "helpers-spec" }), ENCRYPTION_KEY, onRehydrationError)

        const failingConfig = {
            ...config,
            storage: {
                ...config.storage,
                getItem: () => Promise.reject(new Error("read failed")),
            },
        }
        const result = config.getStoredState?.(failingConfig) as Promise<unknown>

        await expect(settledOrSealed(result)).resolves.toBe("sealed")
        expect(onRehydrationError).toHaveBeenCalledTimes(1)
    })
})
