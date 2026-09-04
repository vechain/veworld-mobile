import { encryptTransform } from "./EncryptionService"

describe("encryptTransform", () => {
    it("throws instead of silently dropping a corrupted persisted slice", () => {
        const onError = jest.fn()
        const transform = encryptTransform({ secretKey: "1".repeat(64), onError })

        expect(() => transform.out("not-encrypted-state", "devices", {})).toThrow("Could not decrypt state")
        expect(onError).toHaveBeenCalledTimes(1)
    })
})
