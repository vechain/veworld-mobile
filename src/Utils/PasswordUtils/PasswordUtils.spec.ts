import PasswordUtils from "./PasswordUtils"

describe("PasswordUtils", () => {
    const encryptionKey = "Test123456!"

    it("should hash password without salt", () => {
        expect(PasswordUtils.hash(encryptionKey)).toBe("hex")
    })

    it("should hash password with salt", () => {
        const salt = "vechain-salt"
        expect(PasswordUtils.hash(encryptionKey, salt)).toBe("b83db5072bcde1911a6118d7f0f21c71")
    })
})
