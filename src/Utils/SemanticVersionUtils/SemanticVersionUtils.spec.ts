import SemanticVersionUtils from "./SemanticVersionUtils"

const { compareSemanticVersions, moreThan, moreThanOrEqual } = SemanticVersionUtils

describe("compareSemanticVersions", () => {
    test("should return 0 for identical versions", () => {
        expect(compareSemanticVersions("1.0.0", "1.0.0")).toBe(0)
        expect(compareSemanticVersions("1.0", "1.0")).toBe(0)
        expect(compareSemanticVersions("1", "1")).toBe(0)
    })

    test("should correctly compare different versions", () => {
        expect(compareSemanticVersions("1.0.0", "1.0.1")).toBe(-1)
        expect(compareSemanticVersions("1.0.1", "1.0.0")).toBe(1)
        expect(compareSemanticVersions("1.0", "1.1")).toBe(-1)
        expect(compareSemanticVersions("1.1", "1.0")).toBe(1)
        expect(compareSemanticVersions("1", "2")).toBe(-1)
        expect(compareSemanticVersions("2", "1")).toBe(1)
    })

    test("should handle versions with different number of components", () => {
        expect(compareSemanticVersions("1.0", "1.0.0")).toBe(0)
        expect(compareSemanticVersions("1", "1.0.0")).toBe(0)
        expect(compareSemanticVersions("1", "1.0.1")).toBe(-1)
        expect(compareSemanticVersions("1.0.1", "1.0")).toBe(1)
        expect(compareSemanticVersions("1.0.0", "1.1")).toBe(-1)
    })

    test("should throw an error for invalid version formats", () => {
        expect(() => compareSemanticVersions("1.0.0", "1.0.a")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => compareSemanticVersions("a.b.c", "1.0.0")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => compareSemanticVersions("1..0", "1.0.0")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => compareSemanticVersions("1.0.0", "")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => compareSemanticVersions("", "1.0.0")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
    })

    test("should handle leading zeros correctly", () => {
        expect(compareSemanticVersions("01.0.0", "1.0.0")).toBe(0)
        expect(compareSemanticVersions("1.01.0", "1.1.0")).toBe(0)
        expect(compareSemanticVersions("1.0.01", "1.0.1")).toBe(0)
    })

    test("should compare versions with missing minor or patch parts as if they were zero", () => {
        expect(compareSemanticVersions("1", "1.0")).toBe(0)
        expect(compareSemanticVersions("1.0", "1.0.0")).toBe(0)
        expect(compareSemanticVersions("1.0.1", "1.1")).toBe(-1)
        expect(compareSemanticVersions("1.0", "1.0.1")).toBe(-1)
    })
})

describe("moreThan", () => {
    test("1.0.0 > 2.0.0", () => {
        expect(moreThan("1.0.0", "2.0.0")).toBe(false)
    })
    test("1.0.0 > 1.1.0", () => {
        expect(moreThan("1.0.0", "1.1.0")).toBe(false)
    })
    test("1.0.0 > 1.0.1", () => {
        expect(moreThan("1.0.0", "1.0.1")).toBe(false)
    })
    test("100.100.100 > 101.101.101", () => {
        expect(moreThan("100.100.100", "101.101.101")).toBe(false)
    })
    test("101.101.101 > 100.100.100", () => {
        expect(moreThan("101.101.101", "100.100.100")).toBe(true)
    })
    test("1.0.0 > 0.99999.9999999", () => {
        expect(moreThan("1.0.0", "0.99999.9999999")).toBe(true)
    })
})

describe("moreThanOrEqual", () => {
    test("1.0.0 >= 2.0.0", () => {
        expect(moreThanOrEqual("1.0.0", "2.0.0")).toBe(false)
    })
    test("1.0.0 >= 1.1.0", () => {
        expect(moreThanOrEqual("1.0.0", "1.1.0")).toBe(false)
    })
    test("1.0.0 >= 1.0.1", () => {
        expect(moreThanOrEqual("1.0.0", "1.0.1")).toBe(false)
    })
    test("100.100.100 >= 101.101.101", () => {
        expect(moreThanOrEqual("100.100.100", "101.101.101")).toBe(false)
    })
    test("101.101.101 >= 100.100.100", () => {
        expect(moreThanOrEqual("101.101.101", "100.100.100")).toBe(true)
    })
    test("1.0.0 >= 0.99999.9999999", () => {
        expect(moreThanOrEqual("1.0.0", "0.99999.9999999")).toBe(true)
    })
    test("1.0.0 === 1.0.0", () => {
        expect(moreThanOrEqual("1.0.0", "1.0.0")).toBe(true)
    })
    test("0.0.1 === 0.0.1", () => {
        expect(moreThanOrEqual("1.0.0", "1.0.0")).toBe(true)
    })
})
