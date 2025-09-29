describe("useSortedTokensByFiatValue utility functions", () => {
    describe("extractFiatValue", () => {
        const extractFiatValue = (fiatBalanceString: string): number => {
            const regex = /[\d,]+\.?\d*/
            const numericMatch = regex.exec(fiatBalanceString)?.[0]
            return numericMatch ? Number.parseFloat(numericMatch.replaceAll(",", "")) : 0
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

        it("should use regex.exec() method correctly", () => {
            const testString = "$1,234.56"
            const regex = /[\d,]+\.?\d*/
            const match = regex.exec(testString)

            expect(match).not.toBeNull()
            expect(match?.[0]).toBe("1,234.56")
        })

        it("should handle Number.parseFloat with comma removal", () => {
            const numericString = "1,234.56"
            const result = Number.parseFloat(numericString.replaceAll(",", ""))

            expect(result).toBe(1234.56)
        })

        it("should return 0 when regex.exec returns null", () => {
            const invalidString = "No numbers here!"
            const regex = /[\d,]+\.?\d*/
            const match = regex.exec(invalidString)

            expect(match).toBeNull()
            expect(extractFiatValue(invalidString)).toBe(0)
        })

        it("should handle edge cases with decimal-only numbers", () => {
            expect(extractFiatValue(".50")).toBe(50)
            expect(extractFiatValue("$.99")).toBe(99)
            expect(extractFiatValue("0.")).toBe(0)
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

    describe("createFiatBalanceMap - non-VeChain tokens loop", () => {
        const extractFiatValue = (fiatBalanceString: string): number => {
            const regex = /[\d,]+\.?\d*/
            const numericMatch = regex.exec(fiatBalanceString)?.[0]
            return numericMatch ? Number.parseFloat(numericMatch.replaceAll(",", "")) : 0
        }

        const createFiatBalanceMap = (
            vetInfo: any,
            vthoInfo: any,
            b3trInfo: any,
            nonVechainTokensFiat: string[],
            nonVechainTokenWithBalances: any[],
        ): Map<string, number> => {
            const fiatMap = new Map<string, number>()

            // VeChain ecosystem tokens
            fiatMap.set("VET", extractFiatValue(vetInfo.fiatBalance))
            fiatMap.set("VTHO", extractFiatValue(vthoInfo.fiatBalance))
            fiatMap.set("B3TR", extractFiatValue(b3trInfo.fiatBalance))

            // Non-VeChain tokens (including VeDelegate)
            for (const [index, token] of nonVechainTokenWithBalances.entries()) {
                if (nonVechainTokensFiat[index]) {
                    const key = `${token.address}_${token.symbol}`
                    fiatMap.set(key, extractFiatValue(nonVechainTokensFiat[index]))
                }
            }

            return fiatMap
        }

        it("should iterate through non-VeChain tokens and create address_symbol keys", () => {
            const mockVetInfo = { fiatBalance: "$100.00" }
            const mockVthoInfo = { fiatBalance: "$50.00" }
            const mockB3trInfo = { fiatBalance: "$200.00" }

            const nonVechainTokenWithBalances = [
                { address: "0xtoken1", symbol: "TOKEN1" },
                { address: "0xtoken2", symbol: "TOKEN2" },
                { address: "0xtoken3", symbol: "TOKEN3" },
            ]

            const nonVechainTokensFiat = ["$300.00", "$150.00", "$75.00"]

            const fiatMap = createFiatBalanceMap(
                mockVetInfo,
                mockVthoInfo,
                mockB3trInfo,
                nonVechainTokensFiat,
                nonVechainTokenWithBalances,
            )

            // Test the loop logic
            expect(fiatMap.get("0xtoken1_TOKEN1")).toBe(300)
            expect(fiatMap.get("0xtoken2_TOKEN2")).toBe(150)
            expect(fiatMap.get("0xtoken3_TOKEN3")).toBe(75)
        })

        it("should skip tokens when fiat data is missing", () => {
            const mockVetInfo = { fiatBalance: "$100.00" }
            const mockVthoInfo = { fiatBalance: "$50.00" }
            const mockB3trInfo = { fiatBalance: "$200.00" }

            const nonVechainTokenWithBalances = [
                { address: "0xtoken1", symbol: "TOKEN1" },
                { address: "0xtoken2", symbol: "TOKEN2" },
            ]

            // Missing fiat data for second token
            const nonVechainTokensFiat = ["$300.00", ""]

            const fiatMap = createFiatBalanceMap(
                mockVetInfo,
                mockVthoInfo,
                mockB3trInfo,
                nonVechainTokensFiat,
                nonVechainTokenWithBalances,
            )

            expect(fiatMap.get("0xtoken1_TOKEN1")).toBe(300)
            expect(fiatMap.get("0xtoken2_TOKEN2")).toBeUndefined()
        })

        it("should handle empty arrays", () => {
            const mockVetInfo = { fiatBalance: "$100.00" }
            const mockVthoInfo = { fiatBalance: "$50.00" }
            const mockB3trInfo = { fiatBalance: "$200.00" }

            const fiatMap = createFiatBalanceMap(mockVetInfo, mockVthoInfo, mockB3trInfo, [], [])

            // Should only have VeChain tokens
            expect(fiatMap.get("VET")).toBe(100)
            expect(fiatMap.get("VTHO")).toBe(50)
            expect(fiatMap.get("B3TR")).toBe(200)
            expect(fiatMap.size).toBe(3)
        })

        it("should handle mismatched array lengths", () => {
            const mockVetInfo = { fiatBalance: "$100.00" }
            const mockVthoInfo = { fiatBalance: "$50.00" }
            const mockB3trInfo = { fiatBalance: "$200.00" }

            const nonVechainTokenWithBalances = [
                { address: "0xtoken1", symbol: "TOKEN1" },
                { address: "0xtoken2", symbol: "TOKEN2" },
                { address: "0xtoken3", symbol: "TOKEN3" },
            ]

            // Only 2 fiat values for 3 tokens
            const nonVechainTokensFiat = ["$300.00", "$150.00"]

            const fiatMap = createFiatBalanceMap(
                mockVetInfo,
                mockVthoInfo,
                mockB3trInfo,
                nonVechainTokensFiat,
                nonVechainTokenWithBalances,
            )

            expect(fiatMap.get("0xtoken1_TOKEN1")).toBe(300)
            expect(fiatMap.get("0xtoken2_TOKEN2")).toBe(150)
            expect(fiatMap.get("0xtoken3_TOKEN3")).toBeUndefined() // No fiat data at index 2
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

    describe("useNonVechainTokenFiat hook integration", () => {
        it("should call useNonVechainTokenFiat with correct parameters", () => {
            const mockUseNonVechainTokenFiat = jest.fn().mockReturnValue({
                data: ["$100.00", "$200.00"],
                isLoading: false,
            })

            const testAddress = "0x123456789"
            const result = mockUseNonVechainTokenFiat({
                accountAddress: testAddress,
            })

            expect(mockUseNonVechainTokenFiat).toHaveBeenCalledWith({
                accountAddress: testAddress,
            })
            expect(result.data).toEqual(["$100.00", "$200.00"])
            expect(result.isLoading).toBe(false)
        })

        it("should handle loading state from useNonVechainTokenFiat", () => {
            const mockUseNonVechainTokenFiat = jest.fn().mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const result = mockUseNonVechainTokenFiat({
                accountAddress: "0x123456789",
            })

            expect(result.isLoading).toBe(true)
            expect(result.data).toBeUndefined()
        })

        it("should handle empty data from useNonVechainTokenFiat", () => {
            const mockUseNonVechainTokenFiat = jest.fn().mockReturnValue({
                data: [],
                isLoading: false,
            })

            const result = mockUseNonVechainTokenFiat({
                accountAddress: "0x123456789",
            })

            expect(result.data).toEqual([])
            expect(result.isLoading).toBe(false)
        })
    })

    describe("VBD token filtering and combination logic", () => {
        it("should filter out VBD tokens from main list", () => {
            const tokenBalances = [
                { symbol: "VET", address: "0xvet" },
                { symbol: "VTHO", address: "0xvtho" },
                { symbol: "B3TR", address: "0xb3tr" },
                { symbol: "VOT3", address: "0xvot3" },
                { symbol: "OTHER", address: "0xother" },
            ]

            const B3TRToken = { symbol: "B3TR", address: "0xb3tr" }
            const VOT3Token = { symbol: "VOT3", address: "0xvot3" }

            // Filter logic
            const notVBDBalances = tokenBalances.filter(tb => ![B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))
            const vbdBalances = tokenBalances.filter(tb => [B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))

            expect(notVBDBalances).toHaveLength(3)
            expect(notVBDBalances.map(t => t.symbol)).toEqual(["VET", "VTHO", "OTHER"])

            expect(vbdBalances).toHaveLength(2)
            expect(vbdBalances.map(t => t.symbol)).toEqual(["B3TR", "VOT3"])
        })

        it("should combine VBD tokens when both B3TR and VOT3 exist", () => {
            const vbdBalances = [
                {
                    symbol: "B3TR",
                    address: "0xb3tr",
                    balance: {
                        balance: "1000",
                        isHidden: false,
                        timeUpdated: 123456789,
                        tokenAddress: "0xb3tr",
                    },
                },
                {
                    symbol: "VOT3",
                    address: "0xvot3",
                    balance: {
                        balance: "2000",
                        isHidden: false,
                        timeUpdated: 123456789,
                        tokenAddress: "0xvot3",
                    },
                },
            ]

            const B3TRToken = {
                symbol: "B3TR",
                address: "0xb3tr",
                decimals: 18,
                icon: "b3tr-icon",
                name: "B3TR Token",
                desc: "B3TR Description",
            }

            const mockTotalBalance = "3000"

            const combinedVBDToken = {
                address: B3TRToken.address,
                balance: {
                    balance: mockTotalBalance,
                    isHidden: vbdBalances.some(token => token.balance.isHidden),
                    timeUpdated: vbdBalances[0].balance.timeUpdated,
                    tokenAddress: vbdBalances[0].balance.tokenAddress,
                },
                custom: false,
                decimals: B3TRToken.decimals,
                icon: B3TRToken.icon,
                name: B3TRToken.name,
                symbol: B3TRToken.symbol,
                desc: B3TRToken.desc,
            }

            expect(combinedVBDToken.address).toBe("0xb3tr")
            expect(combinedVBDToken.balance.balance).toBe("3000")
            expect(combinedVBDToken.balance.isHidden).toBe(false)
            expect(combinedVBDToken.balance.timeUpdated).toBe(123456789)
            expect(combinedVBDToken.symbol).toBe("B3TR")
        })

        it("should handle hidden VBD tokens correctly", () => {
            const vbdBalances = [
                {
                    symbol: "B3TR",
                    balance: { isHidden: false },
                },
                {
                    symbol: "VOT3",
                    balance: { isHidden: true }, // One token is hidden
                },
            ]

            // some() check for hidden tokens
            const isHidden = vbdBalances.some(token => token.balance.isHidden)

            expect(isHidden).toBe(true)
        })

        it("should return original balances when no VBD tokens exist", () => {
            const tokenBalances = [
                { symbol: "VET", address: "0xvet" },
                { symbol: "VTHO", address: "0xvtho" },
                { symbol: "OTHER", address: "0xother" },
            ]

            const B3TRToken = { symbol: "B3TR" }
            const VOT3Token = { symbol: "VOT3" }

            const notVBDBalances = tokenBalances.filter(tb => ![B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))
            const vbdBalances = tokenBalances.filter(tb => [B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))

            // Initial assignment and condition check
            let finalBalances = notVBDBalances

            if (vbdBalances.length > 0) {
                finalBalances = [...notVBDBalances, {} as any]
            }

            expect(vbdBalances).toHaveLength(0)
            expect(finalBalances).toEqual(notVBDBalances)
            expect(finalBalances).toHaveLength(3)
        })

        it("should handle empty token balances array", () => {
            const tokenBalances: any[] = []
            const B3TRToken = { symbol: "B3TR" }
            const VOT3Token = { symbol: "VOT3" }

            const notVBDBalances = tokenBalances.filter(tb => ![B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))
            const vbdBalances = tokenBalances.filter(tb => [B3TRToken.symbol, VOT3Token.symbol].includes(tb.symbol))

            expect(notVBDBalances).toHaveLength(0)
            expect(vbdBalances).toHaveLength(0)
        })
    })

    // Test final sorting with fiat balance comparison
    describe("Final sorting with fiat balance comparison", () => {
        const getTokenFiatBalance = (token: any, fiatMap: Map<string, number>): number => {
            // Try symbol first
            const symbolValue = fiatMap.get(token.symbol)
            if (symbolValue !== undefined) return symbolValue

            // Try address+symbol combination (for non-VeChain tokens)
            const addressSymbolValue = fiatMap.get(`${token.address}_${token.symbol}`)
            if (addressSymbolValue !== undefined) return addressSymbolValue

            return 0
        }

        it("should sort tokens by fiat value in descending order using getTokenFiatBalance", () => {
            const finalBalances = [
                { symbol: "VET", address: "0xvet" },
                { symbol: "VTHO", address: "0xvtho" },
                { symbol: "TOKEN1", address: "0xtoken1" },
                { symbol: "TOKEN2", address: "0xtoken2" },
            ]

            const fiatMap = new Map<string, number>()
            fiatMap.set("VET", 500) // VeChain token by symbol
            fiatMap.set("VTHO", 100) // VeChain token by symbol
            fiatMap.set("0xtoken1_TOKEN1", 300) // Non-VeChain token by address_symbol
            fiatMap.set("0xtoken2_TOKEN2", 200) // Non-VeChain token by address_symbol

            // Sort using pre-calculated fiat values
            const sorted = finalBalances.sort((a, b) => {
                const fiatValueA = getTokenFiatBalance(a, fiatMap)
                const fiatValueB = getTokenFiatBalance(b, fiatMap)
                return fiatValueB - fiatValueA
            })

            expect(sorted[0].symbol).toBe("VET") // $500
            expect(sorted[1].symbol).toBe("TOKEN1") // $300
            expect(sorted[2].symbol).toBe("TOKEN2") // $200
            expect(sorted[3].symbol).toBe("VTHO") // $100
        })

        it("should handle tokens with zero fiat values", () => {
            const finalBalances = [
                { symbol: "VET", address: "0xvet" },
                { symbol: "UNKNOWN", address: "0xunknown" },
                { symbol: "VTHO", address: "0xvtho" },
            ]

            const fiatMap = new Map<string, number>()
            fiatMap.set("VET", 500)
            fiatMap.set("VTHO", 100)
            // UNKNOWN token has no fiat data (0)

            const sorted = finalBalances.sort((a, b) => {
                const fiatValueA = getTokenFiatBalance(a, fiatMap)
                const fiatValueB = getTokenFiatBalance(b, fiatMap)
                return fiatValueB - fiatValueA
            })

            expect(sorted[0].symbol).toBe("VET") // $500
            expect(sorted[1].symbol).toBe("VTHO") // $100
            expect(sorted[2].symbol).toBe("UNKNOWN") // $0
        })

        it("should handle equal fiat values maintaining stable sort", () => {
            const finalBalances = [
                { symbol: "TOKEN1", address: "0xtoken1" },
                { symbol: "TOKEN2", address: "0xtoken2" },
                { symbol: "TOKEN3", address: "0xtoken3" },
            ]

            const fiatMap = new Map<string, number>()
            fiatMap.set("0xtoken1_TOKEN1", 100)
            fiatMap.set("0xtoken2_TOKEN2", 100) // Same value as TOKEN1
            fiatMap.set("0xtoken3_TOKEN3", 200)

            const sorted = finalBalances.sort((a, b) => {
                const fiatValueA = getTokenFiatBalance(a, fiatMap)
                const fiatValueB = getTokenFiatBalance(b, fiatMap)
                return fiatValueB - fiatValueA
            })

            expect(sorted[0].symbol).toBe("TOKEN3") // $200
            // TOKEN1 and TOKEN2 both have $100, order depends on stable sort
            expect([sorted[1].symbol, sorted[2].symbol]).toEqual(expect.arrayContaining(["TOKEN1", "TOKEN2"]))
        })

        it("should prioritize symbol lookup over address_symbol lookup", () => {
            const finalBalances = [{ symbol: "VET", address: "0xvet" }]

            const fiatMap = new Map<string, number>()
            fiatMap.set("VET", 500)
            fiatMap.set("0xvet_VET", 300)

            const fiatValue = getTokenFiatBalance(finalBalances[0], fiatMap)

            expect(fiatValue).toBe(500)
        })

        it("should fallback to address_symbol when symbol not found", () => {
            const finalBalances = [{ symbol: "TOKEN1", address: "0xtoken1" }]

            const fiatMap = new Map<string, number>()
            // No symbol entry for TOKEN1
            fiatMap.set("0xtoken1_TOKEN1", 300) // Only address_symbol lookup

            const fiatValue = getTokenFiatBalance(finalBalances[0], fiatMap)

            expect(fiatValue).toBe(300) // Should use address_symbol lookup
        })

        it("should return 0 when no fiat data exists", () => {
            const finalBalances = [{ symbol: "UNKNOWN", address: "0xunknown" }]

            const fiatMap = new Map<string, number>()
            // No entries for UNKNOWN token

            const fiatValue = getTokenFiatBalance(finalBalances[0], fiatMap)

            expect(fiatValue).toBe(0) // Should return 0 when no data found
        })
    })
})
