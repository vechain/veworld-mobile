import { formatAlias, humanUrl, isZero, limitChars, removeUrlProtocolAndPath } from "./FormattingUtils"
import { BigNumber } from "bignumber.js"

describe("isZero", () => {
    it("should return true", () => {
        expect(isZero(new BigNumber(0.0))).toBe(true)
    })
    it("should return false", () => {
        expect(isZero(new BigNumber(1000.00000003))).toBe(false)
    })
})

describe("humanUrl", () => {
    it("should return correctly", () => {
        expect(humanUrl("https://jestjs.io/docs/mock-function-api#mockfnmockresolvedvaluevalue")).toBe(
            "https://…evalue",
        )
    })
})

describe("formatAlias", () => {
    it("should return correctly", () => {
        expect(formatAlias("short")).toBe("short")
        expect(formatAlias("this is a long long long long long long long long alias")).toBe("this i… alias")
    })
})

describe("removeUrlProtocolAndPath", () => {
    it("should return correctly", () => {
        expect(removeUrlProtocolAndPath("https://jestjs.io/docs/mock-function-api#mockfnmockresolvedvaluevalue")).toBe(
            "jestjs.io",
        )
    })
})

describe("limit charachters to 24", () => {
    it("should return correct string length", () => {
        expect(limitChars("qwertyuiop")).toBe("qwertyuiop")
        expect(limitChars("qwertyuiopasdfghjklzxcvbnm")).toBe("qwertyuiopasdfghjklzxcvb")
    })
})
