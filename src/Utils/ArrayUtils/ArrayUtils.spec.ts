import { distinctValues } from "./ArrayUtils"

const arrayWithDuplicates = ["VET", "VTHO", "B3TR", "VET", "VOT3"]

describe("ArrayUtils", () => {
    it("distinctValues - should returs an array of distinct values", () => {
        expect(distinctValues(arrayWithDuplicates)).toEqual(["VET", "VTHO", "B3TR", "VOT3"])
    })
})
