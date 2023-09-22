import ErrorUtils from "."

describe("ErrorUtils", () => {
    it("should read correctly the error message of type unknown", () => {
        try {
            throw new Error("test")
        } catch (e) {
            expect(ErrorUtils.getErrorMessage(e)).toBe("test")
        }
    })
    it("should read correctly the error message of type string", () => {
        try {
            throw "test"
        } catch (e) {
            expect(ErrorUtils.getErrorMessage(e)).toBe("test")
        }
    })
})
