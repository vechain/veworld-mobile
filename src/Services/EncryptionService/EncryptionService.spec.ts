import { CryptoUtils } from "~Utils"
import { encryptTransform } from "./EncryptionService"

describe("encryptTransform", () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("throws instead of silently dropping a slice that cannot be decrypted", () => {
        jest.spyOn(CryptoUtils, "decryptState").mockImplementation(() => {
            throw new Error("decryption failed")
        })
        const onError = jest.fn()
        const transform = encryptTransform({ secretKey: "1".repeat(64), onError })

        expect(() => transform.out("not-encrypted-state", "devices", {})).toThrow(
            "redux-persist-transform-encrypt: Could not decrypt state",
        )
        expect(onError).toHaveBeenCalledWith(
            "Could not decrypt state. Please verify that you are using the correct secret key.",
        )
    })

    it("reports invalid decrypted JSON separately from decryption failures", () => {
        jest.spyOn(CryptoUtils, "decryptState").mockReturnValue("not-json")
        const onError = jest.fn()
        const transform = encryptTransform({ secretKey: "1".repeat(64), onError })

        expect(() => transform.out("encrypted-state", "devices", {})).toThrow(
            "redux-persist-transform-encrypt: Failed to parse decrypted state as JSON.",
        )
        expect(onError).toHaveBeenCalledWith("Failed to parse decrypted state as JSON.")
    })
})
