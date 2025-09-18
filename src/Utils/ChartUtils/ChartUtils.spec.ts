import moment from "moment"
import { downsampleData, getPriceChange } from "./ChartUtils"

describe("ChartUtils", () => {
    describe("getPriceChange", () => {
        it("should return 0 if no data is available", () => {
            expect(getPriceChange()).toBe(0)
            expect(getPriceChange([])).toBe(0)
        })

        it("should return the correct value when populated", () => {
            expect(
                getPriceChange([
                    { timestamp: 0, value: 1 },
                    { timestamp: 1, value: 2 },
                    { timestamp: 2, value: 3 },
                ]),
            ).toBe(2)
        })
    })

    describe("downsampleData", () => {
        it("should return undefined if no data is available", () => {
            expect(downsampleData()).toBeUndefined()
        })

        it("should return correct values when data is available", () => {
            const now = moment().valueOf()
            const inOneHour = moment(now).add(1, "hour").valueOf()
            const inTwoHours = moment(now).add(2, "hour").valueOf()
            const inOneDay = moment(now).add(1, "day").valueOf()

            const downsampled = downsampleData([
                { timestamp: inOneHour, value: 1 },
                { timestamp: inOneHour, value: 2 },
                { timestamp: now.valueOf(), value: 3 },
                { timestamp: now.valueOf(), value: 4 },
                { timestamp: inTwoHours, value: 1 },
                { timestamp: inOneDay, value: 1 },
            ])!

            expect(downsampled).toHaveLength(4)
            expect(downsampled[0].value).toBeCloseTo(1.5)
            expect(downsampled[1].value).toBeCloseTo(3.5)
            expect(downsampled[2].value).toBe(1)
            expect(downsampled[3].value).toBe(1)
        })
    })
})
