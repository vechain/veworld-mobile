import { createKey } from "./CacheKeyUtils"

describe("createKey", () => {
    it("should create a valid key", () => {
        expect(createKey("VeWorld_Theme_Mode_key")).toBe("224753784936b81a0e16096f146fcafe")
    })
})
