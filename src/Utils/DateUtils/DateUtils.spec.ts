import { Locales } from "~i18n"
import { formatDateTime, isValidDateLocale, DEFAULT_TIMEZONE, formatDate, getMomentLocale } from "./DateUtils"

describe("isValidLocale", () => {
    beforeAll(() => {
        global.Intl = require("intl")
    })

    it("should return true for a valid locale", () => {
        expect(isValidDateLocale("en")).toBe(true)
    })

    it("should return false for an invalid locale", () => {
        expect(isValidDateLocale("nonexistent-locale")).toBe(false)
    })
})

describe("formatDateTime", () => {
    beforeAll(() => {
        global.Intl = require("intl")
    })

    it("should format the timestamp correctly in English", () => {
        const timestamp = 1682448820000
        expect(formatDateTime(timestamp, "en", DEFAULT_TIMEZONE)).toBe("Apr 25, 2023 - 6:53")
    })

    it("should return empty string for invalid locale", () => {
        const timestamp = 1682448820000
        expect(formatDateTime(timestamp, "nonexistent-locale", DEFAULT_TIMEZONE)).toBe("")
    })

    it("should return empty string for invalid timezone", () => {
        const timestamp = 1682448820000
        expect(formatDateTime(timestamp, "en", "nonexistent-timezone")).toBe("")
    })

    it("should return empty string for unsupported timezone (Europe/Berlin)", () => {
        const timestamp = 1682448820000
        expect(formatDateTime(timestamp, "en", "Europe/Berlin")).toBe("")
    })

    it("should format the timestamp correctly in Italian", () => {
        const timestamp = 1678689944000
        expect(formatDateTime(timestamp, "it", DEFAULT_TIMEZONE)).toBe("13 mar 2023 - 6:45")
    })

    it("should format the timestamp correctly in German", () => {
        const timestamp = 1678689944000
        expect(formatDateTime(timestamp, "de", DEFAULT_TIMEZONE)).toBe("13. März 2023 - 6:45 vorm.")
    })
})

describe("formatDate", () => {
    const DEFAULT_DATE = new Date(2025, 10, 10)
    it("should display a date with default settings", () => {
        expect(formatDate(DEFAULT_DATE, "en")).toBe("Nov 10")
    })
    it("should display a date with includeYear set to true", () => {
        expect(formatDate(DEFAULT_DATE, "en", { includeYear: true })).toBe("Nov 10, 2025")
    })
    it("should display a date with long month display", () => {
        expect(formatDate(DEFAULT_DATE, "en", { monthDisplay: "long" })).toBe("November 10")
    })
    it("should display a date in Italian with default settings", () => {
        expect(formatDate(DEFAULT_DATE, "it")).toBe("10 nov")
    })
})

describe("getMomentLocale", () => {
    it.each([
        ["tw", "zh-tw"],
        ["zh", "zh-cn"],
        ["de", "de"],
        ["en", "en"],
        ["es", "es"],
        ["fr", "fr"],
        ["hi", "hi"],
        ["it", "it"],
        ["ja", "ja"],
        ["ko", "ko"],
        ["nl", "nl"],
        ["pl", "pl"],
        ["pt", "pt"],
        ["ru", "ru"],
        ["sv", "sv"],
        ["tr", "tr"],
        ["vi", "vi"],
        ["unknown", "en"],
    ])("should get moment locale from %s to %s", (value, expected) => {
        expect(getMomentLocale(value as Locales)).toBe(expected)
    })
})
