import ErrorUtils from "."

describe("ErrorUtils", () => {
    it("should read correctly the error message", () => {
        try {
            throw new Error("test")
        } catch (e) {
            expect(ErrorUtils.getErrorMessage(e)).toBe("test")
        }
    })
})
