import { getTabbar, NavProps } from "./getTabbar"

describe("getTabbar", () => {
    it("returns null when the parent is null", () => {
        const nav = {
            getParent: () => null,
            getState: () => ({
                type: "stack",
            }),
        }
        const result = getTabbar(nav as NavProps)
        expect(result).toBeNull()
    })

    it("returns the parent when the parent type is tab", () => {
        const nav = {
            getParent: () => ({
                getState: () => ({
                    type: "tab",
                }),
            }),
            getState: () => ({
                type: "stack",
            }),
        }
        const result = getTabbar(nav as NavProps)
        expect(result).not.toBeNull()
        expect(result?.getState().type).toBe("tab")
    })

    it("recursively searches for the tabbar parent", () => {
        const nav = {
            getParent: () =>
                ({
                    getState: () => ({
                        type: "stack",
                    }),
                    getParent: () =>
                        ({
                            getState: () => ({
                                type: "tab",
                            }),
                        } as NavProps),
                } as NavProps),
            getState: () => ({
                type: "stack",
            }),
        }
        const result = getTabbar(nav as NavProps)
        expect(result).not.toBeNull()
        expect(result?.getState().type).toBe("tab")
    })
})
