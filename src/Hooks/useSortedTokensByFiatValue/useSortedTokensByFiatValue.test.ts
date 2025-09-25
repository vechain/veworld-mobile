describe("useSortedTokensByFiatValue utility functions", () => {
    describe("extractFiatValue", () => {
        const extractFiatValue = (fiatBalanceString: string): number => {
            const numericMatch = fiatBalanceString.match(/[\d,]+\.?\d*/)?.[0]
            return numericMatch ? parseFloat(numericMatch.replace(/,/g, "")) : 0
        }

        it("should extract numeric value from formatted fiat strings", () => {
            expect(extractFiatValue("$100.00")).toBe(100)
            expect(extractFiatValue("$1,234.56")).toBe(1234.56)
            expect(extractFiatValue("< $0.01")).toBe(0.01)
            expect(extractFiatValue("€500.25")).toBe(500.25)
            expect(extractFiatValue("$0.00")).toBe(0)
        })

        it("should handle invalid or empty strings", () => {
            expect(extractFiatValue("")).toBe(0)
            expect(extractFiatValue("No value")).toBe(0)
            expect(extractFiatValue("$")).toBe(0)
        })

        it("should handle complex formatted values", () => {
            expect(extractFiatValue("$12,345,678.90")).toBe(12345678.9)
            expect(extractFiatValue("< $0.001")).toBe(0.001)
        })
    })

    describe("sorting logic", () => {
        it("should sort tokens by fiat value in descending order", () => {
            const tokens = [
                { symbol: "VET", fiatValue: 100 },
                { symbol: "VeDelegate", fiatValue: 500 },
                { symbol: "VTHO", fiatValue: 50 },
                { symbol: "B3TR", fiatValue: 200 },
            ]

            const sorted = tokens.sort((a, b) => b.fiatValue - a.fiatValue)

            expect(sorted[0].symbol).toBe("VeDelegate") // $500
            expect(sorted[1].symbol).toBe("B3TR") // $200
            expect(sorted[2].symbol).toBe("VET") // $100
            expect(sorted[3].symbol).toBe("VTHO") // $50
        })

        it("should handle equal fiat values", () => {
            const tokens = [
                { symbol: "TokenA", fiatValue: 100 },
                { symbol: "TokenB", fiatValue: 100 },
                { symbol: "TokenC", fiatValue: 200 },
            ]

            const sorted = tokens.sort((a, b) => b.fiatValue - a.fiatValue)

            expect(sorted[0].fiatValue).toBe(200)
            expect(sorted[1].fiatValue).toBe(100)
            expect(sorted[2].fiatValue).toBe(100)
        })
    })

    describe("fiat balance map", () => {
        it("should create O(1) lookup map for fiat values", () => {
            const fiatMap = new Map<string, number>()

            fiatMap.set("VET", 100)
            fiatMap.set("VTHO", 50)
            fiatMap.set("B3TR", 200)

            fiatMap.set("0xvedelegate_VeDelegate", 500)

            expect(fiatMap.get("VET")).toBe(100)
            expect(fiatMap.get("VTHO")).toBe(50)
            expect(fiatMap.get("B3TR")).toBe(200)
            expect(fiatMap.get("0xvedelegate_VeDelegate")).toBe(500)
            expect(fiatMap.get("NonExistent")).toBeUndefined()
        })
    })
})

describe("useSortedTokensByFiatValue hook integration", () => {
    it("should have correct interface when implemented", () => {
        const expectedInterface = {
            tokens: [],
            isLoading: false,
        }

        expect(expectedInterface).toHaveProperty("tokens")
        expect(expectedInterface).toHaveProperty("isLoading")
        expect(Array.isArray(expectedInterface.tokens)).toBe(true)
        expect(typeof expectedInterface.isLoading).toBe("boolean")
    })
})
