import { capitalize } from "./StringUtils"

describe("capitalize", () => {
    it("should return correctly", () => {
        expect(capitalize("foooooo bar")).toBe("Foooooo bar")
    })
})
