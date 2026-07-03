import { Migration39 } from "./Migration39"

describe("Migration39", () => {
    it("sets executionMode to confirm when missing", () => {
        const result = Migration39({ b3mo: { linkedAddress: "0xabc" } } as any) as any
        expect(result.b3mo.executionMode).toBe("confirm")
        expect(result.b3mo.linkedAddress).toBe("0xabc")
    })

    it("preserves an existing executionMode", () => {
        const result = Migration39({ b3mo: { executionMode: "auto", linkedAddress: "0xabc" } } as any) as any
        expect(result.b3mo.executionMode).toBe("auto")
    })

    it("creates the b3mo slice if it doesn't exist", () => {
        const result = Migration39({} as any) as any
        expect(result.b3mo.executionMode).toBe("confirm")
    })
})
