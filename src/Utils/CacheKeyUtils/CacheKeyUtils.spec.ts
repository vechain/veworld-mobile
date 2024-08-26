import { createKey } from "./CacheKeyUtils"

describe("createKey", () => {
    it("should create a valid key", () => {
        expect(createKey("VeWorld_Theme_Mode_key")).toBe("hex")
    })
})
