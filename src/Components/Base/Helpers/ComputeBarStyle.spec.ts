import { computeBarStyle } from "./ComputeBarStyle"

describe("computeBarStyle", () => {
    it("returns 'light-content' when isHero or isDark is true", () => {
        expect(computeBarStyle(true, true)).toBe("light-content")
        expect(computeBarStyle(true, false)).toBe("light-content")
        expect(computeBarStyle(false, true)).toBe("light-content")
    })

    it("returns 'dark-content' when isHero and isDark are false", () => {
        expect(computeBarStyle(false, false)).toBe("dark-content")
        expect(computeBarStyle(undefined, false)).toBe("dark-content")
    })
})
