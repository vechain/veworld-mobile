import PasswordUtils from "./PasswordUtils"

describe("PasswordUtils", () => {
    const encryptionKey = "Test123456!"

    it("should hash password without salt", () => {
        expect(PasswordUtils.hash(encryptionKey)).toBe("49cbc143897d40a775f04737d1caa81a")
    })

    it("should hash password with salt", () => {
        const salt = "vechain-salt"
        expect(PasswordUtils.hash(encryptionKey, salt)).toBe("b83db5072bcde1911a6118d7f0f21c71")
    })
})
