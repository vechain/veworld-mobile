import BloomUtils from "./BloomUtils"

const mockedNewFilter =
    (contains = false) =>
    (_bits: Buffer, _k: number) => ({
        contains: (_buf: Buffer) => contains,
    })

describe("BloomUtils", () => {
    describe("testBloomForAddress", () => {
        it("should return false if the bloom filter contains the address", () => {
            jest.mock("@vechain/connex-driver/dist/bloom", () => ({
                newFilter: mockedNewFilter(true),
            }))
            const isInBloom = BloomUtils.testBloomForAddress("0x456", 3, "0x1")
            expect(isInBloom).toBe(false)
        })

        it("should return false if the bloom filter does not contain the address", () => {
            jest.mock("@vechain/connex-driver/dist/bloom", () => ({
                newFilter: mockedNewFilter(),
            }))

            const isInBloom = BloomUtils.testBloomForAddress(
                "0x123",
                3,
                "0x456",
            )
            expect(isInBloom).toBe(false)
        })
    })
})
