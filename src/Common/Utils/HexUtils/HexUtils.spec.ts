import HexUtils from "./HexUtils"

const hexLowercaseHasPrefix = "0x38983243287eef8773264910fe003"
const hexLowercaseNoPrefix = "38983243287eef8773264910fe003"
const hexUppercaseHasPrefixUppercase = "0X38983243287EEF8773264910FE003"
const hexUppercaseHasPrefixLowercase = "0x38983243287EEF8773264910FE003"
const hexUppercaseNoPrefix = "38983243287EEF8773264910FE003"
const hexMixedcaseHasPrefix = "0x38983243287eEf8773264910Fe003"
const hexMixedcaseNoPrefix = "38983243287eEf8773264910Fe003"
const invalidHex = "0xfsdjkvbdjkfbkjn"
const hexMultiplePrefixes = "0x0X38983243287eef8773264910fe003"

// Remove Prefix
describe("HexUtils tests", () => {
    test("Remove prefix - valid hex lowercase with prefix", () => {
        const result = HexUtils.removePrefix(hexLowercaseHasPrefix)
        expect(result).toBe(hexLowercaseNoPrefix)
    })

    test("Remove prefix - valid hex lowercase without prefix", () => {
        const result = HexUtils.removePrefix(hexLowercaseNoPrefix)
        expect(result).toBe(hexLowercaseNoPrefix)
    })

    test("Remove prefix - valid hex uppercase with prefix", () => {
        const result = HexUtils.removePrefix(hexUppercaseHasPrefixUppercase)
        expect(result).toBe(hexUppercaseNoPrefix)
    })

    test("Remove prefix - valid hex uppercase without prefix", () => {
        const result = HexUtils.removePrefix(hexUppercaseNoPrefix)
        expect(result).toBe(hexUppercaseNoPrefix)
    })

    test("Remove prefix - valid hex mixedcase with prefix", () => {
        const result = HexUtils.removePrefix(hexMixedcaseHasPrefix)
        expect(result).toBe(hexMixedcaseNoPrefix)
    })

    test("Remove prefix - valid hex mixedcase without prefix", () => {
        const result = HexUtils.removePrefix(hexMixedcaseNoPrefix)
        expect(result).toBe(hexMixedcaseNoPrefix)
    })

    test("Remove prefix - invalid hex string", () => {
        expect(() => HexUtils.removePrefix(invalidHex)).toThrow()
    })

    test("Remove prefix - multiple prefix hex string", () => {
        expect(() => HexUtils.removePrefix(hexMultiplePrefixes)).toThrow()
    })

    // Add Prefix

    test("Add prefix - valid hex lowercase with prefix", () => {
        const result = HexUtils.addPrefix(hexLowercaseHasPrefix)
        expect(result).toBe(hexLowercaseHasPrefix)
    })

    test("Add prefix - valid hex lowercase without prefix", () => {
        const result = HexUtils.addPrefix(hexLowercaseNoPrefix)
        expect(result).toBe(hexLowercaseHasPrefix)
    })

    test("Add prefix - valid hex uppercase with prefix", () => {
        const result = HexUtils.addPrefix(hexUppercaseHasPrefixUppercase)
        expect(result).toBe(hexUppercaseHasPrefixLowercase)
    })

    test("Add prefix - valid hex uppercase without prefix", () => {
        const result = HexUtils.addPrefix(hexUppercaseNoPrefix)
        expect(result).toBe(hexUppercaseHasPrefixLowercase)
    })

    test("Add prefix - valid hex mixedcase with prefix", () => {
        const result = HexUtils.addPrefix(hexMixedcaseHasPrefix)
        expect(result).toBe(hexMixedcaseHasPrefix)
    })

    test("Add prefix - valid hex mixedcase without prefix", () => {
        const result = HexUtils.addPrefix(hexMixedcaseNoPrefix)
        expect(result).toBe(hexMixedcaseHasPrefix)
    })

    test("Add prefix - invalid hex string", () => {
        expect(() => HexUtils.addPrefix(invalidHex)).toThrow()
    })

    test("Add prefix - multiple prefix hex string", () => {
        expect(() => HexUtils.addPrefix(hexMultiplePrefixes)).toThrow()
    })

    // Validate

    test("Validate - hex lowercase has prefix", () => {
        expect(() => HexUtils.validate(hexLowercaseHasPrefix)).not.toThrow()
    })

    test("Validate - hex lowercase no prefix", () => {
        expect(() => HexUtils.validate(hexLowercaseNoPrefix)).not.toThrow()
    })

    test("Validate - hex uppercase has prefix uppercase", () => {
        expect(() =>
            HexUtils.validate(hexUppercaseHasPrefixUppercase),
        ).not.toThrow()
    })

    test("Validate - hex uppercase has prefix lowercase", () => {
        expect(() =>
            HexUtils.validate(hexUppercaseHasPrefixLowercase),
        ).not.toThrow()
    })

    test("Validate - hex uppercase no prefix", () => {
        expect(() => HexUtils.validate(hexUppercaseNoPrefix)).not.toThrow()
    })

    test("Validate - hex mixedcase has prefix", () => {
        expect(() => HexUtils.validate(hexMixedcaseHasPrefix)).not.toThrow()
    })

    test("Validate - hex mixedcase no prefix", () => {
        expect(() => HexUtils.validate(hexMixedcaseNoPrefix)).not.toThrow()
    })

    test("Validate - invalid hex string", () => {
        expect(() => HexUtils.validate(invalidHex)).toThrow()
    })

    test("Validate - multiple prefix hex string", () => {
        expect(() => HexUtils.validate(hexMultiplePrefixes)).toThrow()
    })

    // Is Valid

    test("Is Valid - hex lowercase has prefix", () => {
        expect(HexUtils.isValid(hexLowercaseHasPrefix)).toBeTruthy()
    })

    test("Is Valid - hex lowercase no prefix", () => {
        expect(HexUtils.isValid(hexLowercaseNoPrefix)).toBeTruthy()
    })

    test("Is Valid - hex uppercase has prefix uppercase", () => {
        expect(HexUtils.isValid(hexUppercaseHasPrefixUppercase)).toBeTruthy()
    })

    test("Is Valid - hex uppercase has prefix lowercase", () => {
        expect(HexUtils.isValid(hexUppercaseHasPrefixLowercase)).toBeTruthy()
    })

    test("Is Valid - hex uppercase no prefix", () => {
        expect(HexUtils.isValid(hexUppercaseNoPrefix)).toBeTruthy()
    })

    test("Is Valid - hex mixedcase has prefix", () => {
        expect(HexUtils.isValid(hexMixedcaseHasPrefix)).toBeTruthy()
    })

    test("Is Valid - hex mixedcase no prefix", () => {
        expect(HexUtils.isValid(hexMixedcaseNoPrefix)).toBeTruthy()
    })

    test("Is Valid - invalid hex string", () => {
        expect(HexUtils.isValid(invalidHex)).toBeFalsy()
    })

    test("Is Valid - multiple prefix hex string", () => {
        expect(HexUtils.isValid(hexMultiplePrefixes)).toBeFalsy()
    })

    // Generate Random

    test("Generate Random", () => {
        for (let len = 1; len < 1000; len++) {
            const randHex = HexUtils.generateRandom(len)
            expect(HexUtils.isValid(randHex)).toBeTruthy()
            expect(randHex.length).toBe(len + 2)
            expect(/^0x/.test(randHex)).toBeTruthy()
        }
    })

    test("Generate Random - length 0", () => {
        expect(() => HexUtils.generateRandom(0)).toThrow()
    })

    test("Generate Random - length -1", () => {
        expect(() => HexUtils.generateRandom(-1)).toThrow()
    })
})
