import { assertDefined } from "./TypeUtils"

describe("TypeUtils", () => {
    describe("assertDefined", () => {
        it("should throw an error when passing a null value", () => {
            expect(() => assertDefined(null)).toThrow("[assertDefined]: argument is not defined")
        })
        it("should throw an error when passing an undefined value", () => {
            expect(() => assertDefined(undefined)).toThrow("[assertDefined]: argument is not defined")
        })
        it("should not throw an error when passing a valid value", () => {
            expect(() => assertDefined(1)).not.toThrow()
        })
        it("should not throw an error when passing a falsy value", () => {
            expect(() => assertDefined(0)).not.toThrow()
        })
    })
})
