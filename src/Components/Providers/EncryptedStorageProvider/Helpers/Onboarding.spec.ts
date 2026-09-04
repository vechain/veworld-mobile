import { MMKV } from "react-native-mmkv"
import { DEVICE_TYPE } from "~Model"
import { CryptoUtils } from "~Utils"
import Onboarding from "./Onboarding"

const ROOT_STATE_KEY = "persist:root"
const ONBOARDING_KEY = "1".repeat(64)
const ENCRYPTED_KEY = "2".repeat(64)

const createStorage = () => {
    const values = new Map<string, string>()

    return {
        storage: {
            getString: jest.fn((key: string) => values.get(key)),
            set: jest.fn((key: string, value: string) => values.set(key, value)),
            delete: jest.fn((key: string) => values.delete(key)),
            getAllKeys: jest.fn(() => [...values.keys()]),
        } as unknown as MMKV,
        values,
    }
}

const serializeSlice = (value: unknown, key: string) => JSON.stringify(CryptoUtils.encryptState(value, key))

describe("onboarding storage migration", () => {
    beforeEach(() => {
        jest.spyOn(CryptoUtils, "encryptState").mockImplementation(value =>
            Buffer.from(JSON.stringify(value)).toString("hex"),
        )
        jest.spyOn(CryptoUtils, "decryptState").mockImplementation(value => Buffer.from(value, "hex").toString())
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("preserves slice runtime types and validates the wallet-bearing device", () => {
        const source = createStorage()
        const destination = createStorage()
        const devices = [
            {
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
                wallet: "encrypted-wallet",
            },
        ]
        const accounts = { selectedAccount: { address: devices[0].rootAddress } }

        source.values.set(
            ROOT_STATE_KEY,
            JSON.stringify({
                devices: serializeSlice(devices, ONBOARDING_KEY),
                accounts: serializeSlice(accounts, ONBOARDING_KEY),
            }),
        )

        Onboarding.migrateState({
            onboardingStorage: source.storage,
            encryptedStorage: destination.storage,
            onboardingKey: ONBOARDING_KEY,
            encryptionKey: ENCRYPTED_KEY,
        })

        const migrated = Onboarding.decryptPersistedState(destination.values.get(ROOT_STATE_KEY)!, ENCRYPTED_KEY)
        expect(migrated.devices).toEqual(devices)
        expect(migrated.accounts).toEqual(accounts)
        expect(Array.isArray(migrated.devices)).toBe(true)
    })

    it("rejects a migrated snapshot without a usable device", () => {
        const source = createStorage()
        const destination = createStorage()
        source.values.set(
            ROOT_STATE_KEY,
            JSON.stringify({
                devices: serializeSlice([], ONBOARDING_KEY),
                accounts: serializeSlice({ selectedAccount: undefined }, ONBOARDING_KEY),
            }),
        )

        expect(() =>
            Onboarding.migrateState({
                onboardingStorage: source.storage,
                encryptedStorage: destination.storage,
                onboardingKey: ONBOARDING_KEY,
                encryptionKey: ENCRYPTED_KEY,
            }),
        ).toThrow("Migrated state has no devices")
    })

    it("throws when the written state does not read back verbatim", () => {
        const source = createStorage()
        const destination = createStorage()
        const rootAddress = "0xec954b8e81777354d0a35111d83373b9ec171c64"
        source.values.set(
            ROOT_STATE_KEY,
            JSON.stringify({
                devices: serializeSlice(
                    [{ type: DEVICE_TYPE.LOCAL_MNEMONIC, rootAddress, wallet: "encrypted-wallet" }],
                    ONBOARDING_KEY,
                ),
                accounts: serializeSlice({ selectedAccount: { address: rootAddress } }, ONBOARDING_KEY),
            }),
        )
        ;(destination.storage.getString as jest.Mock).mockReturnValue("truncated-write")

        expect(() =>
            Onboarding.migrateState({
                onboardingStorage: source.storage,
                encryptedStorage: destination.storage,
                onboardingKey: ONBOARDING_KEY,
                encryptionKey: ENCRYPTED_KEY,
            }),
        ).toThrow("Failed to write migrated state")
    })

    it("rejects a local device whose encrypted wallet is not a non-empty string", () => {
        const source = createStorage()
        const destination = createStorage()
        const rootAddress = "0xec954b8e81777354d0a35111d83373b9ec171c64"
        source.values.set(
            ROOT_STATE_KEY,
            JSON.stringify({
                devices: serializeSlice(
                    [{ type: DEVICE_TYPE.LOCAL_MNEMONIC, rootAddress, wallet: {} }],
                    ONBOARDING_KEY,
                ),
                accounts: serializeSlice({ selectedAccount: { address: rootAddress } }, ONBOARDING_KEY),
            }),
        )

        expect(() =>
            Onboarding.migrateState({
                onboardingStorage: source.storage,
                encryptedStorage: destination.storage,
                onboardingKey: ONBOARDING_KEY,
                encryptionKey: ENCRYPTED_KEY,
            }),
        ).toThrow("Migrated local device has no encrypted wallet")
    })
})
