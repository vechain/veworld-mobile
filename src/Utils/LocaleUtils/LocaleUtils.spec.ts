import { getLocale, getLanguageTag } from "./LocaleUtils"

describe("getCorrectLocale", () => {
    it("should return correctly", () => {
        expect(getLocale()).toEqual("en")
    })
})

describe("getCorrectLanguageTag", () => {
    it("should return correctly", () => {
        expect(getLanguageTag()).toEqual("en-US")
    })
})
