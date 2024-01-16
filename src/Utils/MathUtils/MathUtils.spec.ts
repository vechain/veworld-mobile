import MathUtils from "./MathUtils"

describe("getOdd", () => {
    it("should return true for odd numbers", () => {
        expect(MathUtils.getOdd(3)).toBe(true)
        expect(MathUtils.getOdd(7)).toBe(true)
        expect(MathUtils.getOdd(11)).toBe(true)
    })

    it("should return false for even numbers", () => {
        expect(MathUtils.getOdd(2)).toBe(false)
        expect(MathUtils.getOdd(6)).toBe(false)
        expect(MathUtils.getOdd(10)).toBe(false)
    })
})

describe("getEven", () => {
    it("should return true for even numbers", () => {
        expect(MathUtils.getEven(2)).toBe(true)
        expect(MathUtils.getEven(6)).toBe(true)
        expect(MathUtils.getEven(10)).toBe(true)
    })

    it("should return false for odd numbers", () => {
        expect(MathUtils.getEven(3)).toBe(false)
        expect(MathUtils.getEven(7)).toBe(false)
        expect(MathUtils.getEven(11)).toBe(false)
    })
})
