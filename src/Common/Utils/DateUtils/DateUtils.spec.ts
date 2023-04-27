import { formatDateTime, isValidDateLocale } from "./DateUtils"

describe("isValidLocale", () => {
    it("should return true for a valid locale", () => {
        expect(isValidDateLocale("en")).toBe(true)
    })

    it("should return false for an invalid locale", () => {
        expect(isValidDateLocale("nonexistent-locale")).toBe(false)
    })
})

describe("formatDateTime", () => {
    it("should format the timestamp correctly in English", () => {
        const timestamp = 1682448820000
        expect(formatDateTime(timestamp, "en", "UTC")).toBe(
            "Apr 25, 2023 - 6:53 pm",
        )
    })

    it("should throw an error for invalid locale", () => {
        const timestamp = 1682448820000
        expect(() =>
            formatDateTime(timestamp, "nonexistent-locale", "UTC"),
        ).toThrow("Invalid locale: nonexistent-locale.")
    })

    it("should throw an error for invalid timezone", () => {
        const timestamp = 1682448820000
        expect(() =>
            formatDateTime(timestamp, "en", "nonexistent-timezone"),
        ).toThrow("Invalid timezone: nonexistent-timezone.")
    })

    it("should format the timestamp with Europe/Berlin timezone", () => {
        const timestamp = 1682448820000
        expect(formatDateTime(timestamp, "en", "Europe/Berlin")).toBe(
            "Apr 25, 2023 - 8:53 pm",
        )
    })

    it("should format the timestamp correctly in Italian", () => {
        const timestamp = 1678689944000
        expect(formatDateTime(timestamp, "it", "UTC")).toBe(
            "13 mar 2023 - 6:45 am",
        )
    })

    it("should format the timestamp correctly in German", () => {
        const timestamp = 1678689944000
        expect(formatDateTime(timestamp, "de", "UTC")).toBe(
            "13. März 2023 - 6:45 am",
        )
    })
})
