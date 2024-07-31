import VersionUtils from "./VersionUtils"

describe("VersionUtils.compareSemanticVersions", () => {
    test("should return 0 for identical versions", () => {
        expect(VersionUtils.compareSemanticVersions("1.0.0", "1.0.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1.0", "1.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1", "1")).toBe(0)
    })

    test("should correctly compare different versions", () => {
        expect(VersionUtils.compareSemanticVersions("1.0.0", "1.0.1")).toBe(-1)
        expect(VersionUtils.compareSemanticVersions("1.0.1", "1.0.0")).toBe(1)
        expect(VersionUtils.compareSemanticVersions("1.0", "1.1")).toBe(-1)
        expect(VersionUtils.compareSemanticVersions("1.1", "1.0")).toBe(1)
        expect(VersionUtils.compareSemanticVersions("1", "2")).toBe(-1)
        expect(VersionUtils.compareSemanticVersions("2", "1")).toBe(1)
    })

    test("should handle versions with different number of components", () => {
        expect(VersionUtils.compareSemanticVersions("1.0", "1.0.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1", "1.0.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1", "1.0.1")).toBe(-1)
        expect(VersionUtils.compareSemanticVersions("1.0.1", "1.0")).toBe(1)
        expect(VersionUtils.compareSemanticVersions("1.0.0", "1.1")).toBe(-1)
    })

    test("should throw an error for invalid version formats", () => {
        expect(() => VersionUtils.compareSemanticVersions("1.0.0", "1.0.a")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => VersionUtils.compareSemanticVersions("a.b.c", "1.0.0")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => VersionUtils.compareSemanticVersions("1..0", "1.0.0")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => VersionUtils.compareSemanticVersions("1.0.0", "")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
        expect(() => VersionUtils.compareSemanticVersions("", "1.0.0")).toThrow(
            "Invalid version format. Versions should be in x.x.x, x.x, or x format.",
        )
    })

    test("should handle leading zeros correctly", () => {
        expect(VersionUtils.compareSemanticVersions("01.0.0", "1.0.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1.01.0", "1.1.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1.0.01", "1.0.1")).toBe(0)
    })

    test("should compare versions with missing minor or patch parts as if they were zero", () => {
        expect(VersionUtils.compareSemanticVersions("1", "1.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1.0", "1.0.0")).toBe(0)
        expect(VersionUtils.compareSemanticVersions("1.0.1", "1.1")).toBe(-1)
        expect(VersionUtils.compareSemanticVersions("1.0", "1.0.1")).toBe(-1)
    })
})
