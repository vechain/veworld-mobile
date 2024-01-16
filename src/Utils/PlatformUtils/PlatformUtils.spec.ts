import { isAndroid, isIOS } from "./PlatformUtils"

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
