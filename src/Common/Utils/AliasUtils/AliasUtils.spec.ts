import { compareAliases } from "./AliasUtils"

describe("AliasUtils.compareAliases", () => {
    test("Same Alias - should return true", () => {
        expect(compareAliases("same", "same")).toBeTruthy()
    })

    test("Same Alias Different Case - should return true", () => {
        expect(compareAliases("differentcase", "DIFFERENTCASE")).toBeTruthy()
    })

    test("Same Alias Mixed Case - should return true", () => {
        expect(compareAliases("MixedCase", "MiXeDCaSe")).toBeTruthy()
    })

    test("Same Alias, second has leading spaces - should return true", () => {
        expect(
            compareAliases("leadingspaces", "    leadingspaces"),
        ).toBeTruthy()
    })

    test("Same Alias, first has leading spaces - should return true", () => {
        expect(
            compareAliases("    leadingspaces", "leadingspaces"),
        ).toBeTruthy()
    })

    test("Same Alias, second has trailing spaces - should return true", () => {
        expect(
            compareAliases("leadingspaces", "leadingspaces    "),
        ).toBeTruthy()
    })

    test("Same Alias, first has trailing spaces - should return true", () => {
        expect(compareAliases("leadingspaces   ", "leadingspaces")).toBeTruthy()
    })

    test("Same Alias, second has leading and trailing spaces - should return true", () => {
        expect(
            compareAliases("leadingspaces", "    leadingspaces    "),
        ).toBeTruthy()
    })

    test("Same Alias, first has leading and trailing spaces - should return true", () => {
        expect(
            compareAliases("     leadingspaces   ", "leadingspaces"),
        ).toBeTruthy()
    })

    test("Different Alias - should return false", () => {
        expect(compareAliases("same", "not")).toBeFalsy()
    })

    test("Different Alias, second contains the first - should return false", () => {
        expect(compareAliases("same", "notthesame")).toBeFalsy()
    })

    test("Different Alias, first contains the second - should return false", () => {
        expect(compareAliases("notthesame", "same")).toBeFalsy()
    })

    test("Numeric values - should return false", () => {
        expect(compareAliases(123, 123)).toBeFalsy()
    })

    test("Object values - should return false", () => {
        expect(compareAliases({ field: "123" }, { field: "123" })).toBeFalsy()
    })
})
