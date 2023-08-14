import { capitalize, truncateTextIfSizeIsGreaterThan } from "./StringUtils"

describe("capitalize", () => {
    it("should return correctly", () => {
        expect(capitalize("foooooo bar")).toBe("Foooooo bar")
    })
})

describe("truncateTextIfSizeIsGreaterThan", () => {
    it("should return correctly", () => {
        expect(truncateTextIfSizeIsGreaterThan(5, "foooooo bar")).toBe(
            "foooo...",
        )
    })
})
