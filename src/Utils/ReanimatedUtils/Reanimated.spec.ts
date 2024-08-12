/* eslint-disable max-len */
import { convertSmallSciNotationToDecimal, numberToPercentWorklet } from "./Reanimated"

describe("Reanimated convertSmallSciNotationToDecimal function", function () {
    /*
        The condition if (!num.includes("e-")) checks whether the number in the variable num is in scientific notation with a negative exponent. Therefore, the value of value should be a number that is greater than or equal to 1e-4 and less than 1e5 (100,000) in order for the conditional to be true and return num in non-scientific notation with a precision of 4.

        For example, if value is 12345.6789, then num would be "1.235e+4" and the conditional would be false, so num would not be returned. But if value is 0.000123456789, then num would be "0.00012346" and the conditional would be true, so num would be returned.
    */
    it("should return the correct value after precision", function () {
        const value = 0.000123456789
        expect(convertSmallSciNotationToDecimal(value)).toBe(value.toPrecision(4))
    })
})

describe("Reanimated numberToPercentWorklet function", function () {
    it("should return the correct value after precision", function () {
        const value = 15.4
        expect(
            numberToPercentWorklet(value, {
                precision: 2,
                absolute: true,
            }),
        ).toBe(`${value.toFixed(2)}%`)
    })
})
