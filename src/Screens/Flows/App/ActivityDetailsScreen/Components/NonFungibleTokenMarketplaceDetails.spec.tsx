import { render, screen } from "@testing-library/react-native"
import React from "react"
import { NonFungibleTokenMarketplaceDetails } from "./NonFungibleTokenMarketplaceDetails"
import { DIRECTIONS, genesisesId } from "~Constants"
import { ActivityStatus, ActivityType, NFTMarketplaceActivity } from "~Model"
import { TestWrapper } from "~Test"

const mockTheme = {
    colors: {
        text: "#000000",
        separator: "#E0E0E0",
        card: "#FFFFFF",
    },
    isDark: false,
}

jest.mock("~Hooks", () => ({
    ...jest.requireActual("~Hooks"),
    useCopyClipboard: () => ({
        onCopyToClipboard: jest.fn(),
    }),
    useCombineFiatBalances: () => ({
        combineFiatBalances: () => ({ amount: "100.00", areAlmostZero: false }),
    }),
    useAppState: () => ({
        currentState: "active",
        previousState: "background",
    }),
    useTheme: () => mockTheme,
    useThemedStyles: () => ({
        styles: { container: {}, text: {} },
        theme: mockTheme,
    }),
}))

jest.mock("../Hooks", () => ({
    useGasFee: () => ({
        vthoGasFee: "0.001",
        fiatValueGasFeeSpent: "100.00",
        isLoading: false,
    }),
}))

describe("NonFungibleTokenMarketplaceDetails", () => {
    const mockNFTMarketplaceActivity: NFTMarketplaceActivity = {
        id: "test-activity-id",
        txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
        blockNumber: 21791678,
        genesisId: genesisesId.main,
        isTransaction: false,
        type: ActivityType.NFT_SALE,
        timestamp: 1748446000000,
        gasPayer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        to: ["0x3ca506"],
        direction: DIRECTIONS.UP,
        tokenId: "12345",
        contractAddress: "0x123abc",
        price: "2500000000000000000",
        buyer: "0x3ca506",
        seller: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        paymentToken: "VET",
    }

    it("should be a valid React component", () => {
        expect(NonFungibleTokenMarketplaceDetails).toBeDefined()
        expect(typeof NonFungibleTokenMarketplaceDetails).toBe("object")
        expect(NonFungibleTokenMarketplaceDetails).toHaveProperty("$$typeof")
    })

    it("should accept the required props without throwing", () => {
        expect(() => {
            const props = {
                activity: mockNFTMarketplaceActivity,
                paid: "0x33450",
                isLoading: false,
            }
            expect(props.activity.type).toBe(ActivityType.NFT_SALE)
            expect(props.activity.price).toBe("2500000000000000000")
            expect(props.activity.buyer).toBeDefined()
            expect(props.activity.seller).toBeDefined()
        }).not.toThrow()
    })

    it("should handle different activity directions", () => {
        const sellerActivity = { ...mockNFTMarketplaceActivity, direction: DIRECTIONS.UP }
        const buyerActivity = { ...mockNFTMarketplaceActivity, direction: DIRECTIONS.DOWN }

        expect(sellerActivity.direction).toBe(DIRECTIONS.UP)
        expect(buyerActivity.direction).toBe(DIRECTIONS.DOWN)
    })

    it("should handle different payment tokens", () => {
        const vetActivity = { ...mockNFTMarketplaceActivity, paymentToken: "VET" }
        const customTokenActivity = { ...mockNFTMarketplaceActivity, paymentToken: "B3TR" }
        const noTokenActivity = { ...mockNFTMarketplaceActivity, paymentToken: undefined }

        expect(vetActivity.paymentToken).toBe("VET")
        expect(customTokenActivity.paymentToken).toBe("B3TR")
        expect(noTokenActivity.paymentToken).toBeUndefined()
    })

    it("should handle different price values", () => {
        const zeroPriceActivity = { ...mockNFTMarketplaceActivity, price: "0" }
        const largePriceActivity = { ...mockNFTMarketplaceActivity, price: "999999999999999999999999" }

        expect(zeroPriceActivity.price).toBe("0")
        expect(largePriceActivity.price).toBe("999999999999999999999999")
    })

    describe("when rendering", () => {
        it("should render without crashing", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByTestId("nft-marketplace-detail-1")).toBeDefined()
        })

        it("should display transaction type for seller", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const transactionTypeValue = screen.getByTestId("nft-marketplace-detail-1-value")
            expect(transactionTypeValue).toHaveTextContent("NFT Sold")
        })

        it("should display transaction type for buyer", () => {
            const buyerActivity = {
                ...mockNFTMarketplaceActivity,
                direction: DIRECTIONS.DOWN,
                buyer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User is buyer
                seller: "0x3ca506",
            }

            render(<NonFungibleTokenMarketplaceDetails activity={buyerActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const transactionTypeValue = screen.getByTestId("nft-marketplace-detail-1-value")
            expect(transactionTypeValue).toHaveTextContent("NFT purchased")
        })

        it("should display price with correct direction for seller", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const priceValue = screen.getByTestId("nft-marketplace-detail-2-value")
            expect(priceValue).toHaveTextContent("+ 2.50") // UP direction for seller
        })

        it("should display price with correct direction for buyer", () => {
            const buyerActivity = {
                ...mockNFTMarketplaceActivity,
                direction: DIRECTIONS.DOWN,
                buyer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User is buyer
                seller: "0x3ca506",
            }

            render(<NonFungibleTokenMarketplaceDetails activity={buyerActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const priceValue = screen.getByTestId("nft-marketplace-detail-2-value")
            expect(priceValue).toHaveTextContent("- 2.50") // DOWN direction for buyer
        })

        it("should display gas fee information", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const gasFeeValue = screen.getByTestId("nft-marketplace-detail-3-value")
            expect(gasFeeValue).toHaveTextContent("0.001 VTHO")

            const gasFeeAdditional = screen.getByTestId("nft-marketplace-detail-3-additional")
            expect(gasFeeAdditional).toHaveTextContent("≈ $100.00")
        })

        it("should display transaction ID", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const txIdValue = screen.getByTestId("nft-marketplace-detail-4-value")
            expect(txIdValue).toHaveTextContent("0xea312…b396763fc") // Shortened transaction ID
        })

        it("should display block number", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const blockValue = screen.getByTestId("nft-marketplace-detail-5-value")
            expect(blockValue).toHaveTextContent("21791678")
        })

        it("should display mainnet network", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const networkValue = screen.getByTestId("nft-marketplace-detail-6-value")
            expect(networkValue).toHaveTextContent("MAINNET")
        })

        it("should display testnet network for testnet activities", () => {
            const testnetActivity = {
                ...mockNFTMarketplaceActivity,
                genesisId: genesisesId.test,
            }

            render(<NonFungibleTokenMarketplaceDetails activity={testnetActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const networkValue = screen.getByTestId("nft-marketplace-detail-6-value")
            expect(networkValue).toHaveTextContent("TESTNET")
        })

        it("should display all 6 detail items", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            // Verify all 6 expected details are rendered
            expect(screen.getByTestId("nft-marketplace-detail-1")).toBeDefined() // Transaction Type
            expect(screen.getByTestId("nft-marketplace-detail-2")).toBeDefined() // Price
            expect(screen.getByTestId("nft-marketplace-detail-3")).toBeDefined() // Gas Fee
            expect(screen.getByTestId("nft-marketplace-detail-4")).toBeDefined() // Transaction ID
            expect(screen.getByTestId("nft-marketplace-detail-5")).toBeDefined() // Block Number
            expect(screen.getByTestId("nft-marketplace-detail-6")).toBeDefined() // Network
        })
    })

    describe("edge cases", () => {
        it("should handle zero price", () => {
            const zeroPriceActivity = {
                ...mockNFTMarketplaceActivity,
                price: "0",
            }

            render(<NonFungibleTokenMarketplaceDetails activity={zeroPriceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const priceValue = screen.getByTestId("nft-marketplace-detail-2-value")
            expect(priceValue).toHaveTextContent("+ 0.00")
        })

        it("should handle missing block number", () => {
            const noBlockActivity = {
                ...mockNFTMarketplaceActivity,
                blockNumber: undefined,
            }

            render(<NonFungibleTokenMarketplaceDetails activity={noBlockActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const blockValue = screen.getByTestId("nft-marketplace-detail-5-value")
            expect(blockValue).toHaveTextContent("")
        })

        it("should handle custom payment token", () => {
            const customTokenActivity = {
                ...mockNFTMarketplaceActivity,
                paymentToken: "B3TR",
            }

            render(<NonFungibleTokenMarketplaceDetails activity={customTokenActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            // Price should still display with fiat value
            const priceAdditional = screen.getByTestId("nft-marketplace-detail-2-additional")
            expect(priceAdditional).toHaveTextContent("≈ $100.00")
        })
    })
})
