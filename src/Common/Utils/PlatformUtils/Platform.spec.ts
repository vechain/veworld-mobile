import { isAndroid, isIOS } from "./Platform"

describe("isIOS", () => {
    it("should return true", () => {
        expect(isIOS()).toBe(true)
    })
})

describe("isAndroid", () => {
    it("should return false", () => {
        expect(isAndroid()).toBe(false)
    })
})
