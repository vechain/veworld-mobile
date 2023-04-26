import { getLocale } from "./LocaleUtils"

describe("getCorrectLocale", () => {
    it("should return correctly", () => {
        expect(getLocale()).toEqual("en")
    })
})
