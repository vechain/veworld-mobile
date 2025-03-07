import { capitalize, toUppercase, truncateTextIfSizeIsGreaterThan } from "./StringUtils"

describe(capitalize.name, () => {
    it("should return correctly", () => {
        expect(capitalize("foooooo bar")).toBe("Foooooo bar")
    })
})

describe(truncateTextIfSizeIsGreaterThan.name, () => {
    it("should return correctly", () => {
        expect(truncateTextIfSizeIsGreaterThan(5, "foooooo bar")).toBe("foooo...")
    })
})

describe(toUppercase.name, () => {
    it("should return correctly", () => {
        expect(toUppercase("test")).toBe("TEST")
    })
})
