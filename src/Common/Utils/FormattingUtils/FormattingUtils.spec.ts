import { scaleNumberDown, scaleNumberUp } from "./FormattingUtils"

describe("scaleNumberUp - positive testing", () => {
    test("scale up by 2 decimals", () => {
        expect(scaleNumberUp(5, 2)).toEqual("500")
    })

    test("scale up by 10 decimals", () => {
        expect(scaleNumberUp(6, 10)).toEqual("60000000000")
    })

    test("scale up by 0", () => {
        expect(scaleNumberUp(500, 0)).toBe("500")
    })

    test("scale up by 16 decimals", () => {
        expect(scaleNumberUp("7", 16)).toEqual("70000000000000000")
    })
})

describe("scaleNumberUp - negative testing", () => {
    const originalError = console.error
    beforeAll(() => {
        // mute the errors in the console
        console.error = jest.fn()
    })
    afterAll(() => {
        // unmute the errors
        console.error = originalError
    })

    test("scale up by a negative number", () => {
        expect(() => scaleNumberUp(5, -1)).toThrow()
    })

    test("scale up an invalid number", () => {
        expect(() => scaleNumberUp("notanumber", 10)).toThrow()
    })
})

describe("scaleNumberDown - positive testing", () => {
    test("scale down by 2 decimals", () => {
        expect(scaleNumberDown(500, 2)).toEqual("5")
    })

    test("scale down by 0", () => {
        expect(scaleNumberDown(500, 0)).toBe("500")
    })

    test("scale down by 10 decimals", () => {
        expect(scaleNumberDown("60000000000", 10)).toEqual("6")
    })

    test("scale down by 16 decimals", () => {
        expect(scaleNumberDown("70000000000000000", 16)).toEqual("7")
    })
})

describe("scaleNumberDown - negative testing", () => {
    const originalError = console.error
    beforeAll(() => {
        // mute the errors in the console
        console.error = jest.fn()
    })
    afterAll(() => {
        // unmute the errors
        console.error = originalError
    })

    test("scale down by a negative number", () => {
        expect(() => scaleNumberDown(500, -1)).toThrow()
    })

    test("scale down an invalid number", () => {
        expect(() => scaleNumberDown("notanumber", 10)).toThrow()
    })

    test("scale down by too many decimals", () => {
        expect(scaleNumberDown("600", 10)).toEqual("0")
    })
})
