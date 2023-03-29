import { getSupportedLanguages } from "./LanguageUtils"

describe("getSupportedLanguages", () => {
    it("should return correctly", () => {
        expect(getSupportedLanguages()).toEqual(["English"])
    })
})
