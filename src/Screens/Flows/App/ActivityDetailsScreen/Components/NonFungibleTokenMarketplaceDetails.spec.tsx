import { render, screen } from "@testing-library/react-native"
import React from "react"
import { NonFungibleTokenMarketplaceDetails } from "./NonFungibleTokenMarketplaceDetails"

import { TestWrapper } from "~Test"
import { DIRECTIONS, genesisesId } from "~Constants"
import { ActivityStatus, ActivityType, NFTMarketplaceActivity } from "~Model"

const mockOnCopyToClipboard = jest.fn()

jest.mock("~Hooks", () => ({
    ...jest.requireActual("~Hooks"),
    useCopyClipboard: () => ({
        onCopyToClipboard: mockOnCopyToClipboard,
    }),
    useAppState: () => ({
        currentState: "active",
        previousState: "background",
    }),
    useTheme: () => ({
        colors: {
            text: "#000000",
            separator: "#E0E0E0",
        },
    }),
    useThemedStyles: () => ({
        styles: {},
        theme: {
            colors: {
                text: "#000000",
                separator: "#E0E0E0",
            },
        },
    }),
    useCombineFiatBalances: () => ({
        combineFiatBalances: jest.fn(() => ({
            amount: "100.00",
            areAlmostZero: false,
        })),
    }),
    useNFTInfo: () => ({
        collectionName: "Test Collection",
        tokenMetadata: { name: "Test NFT", image: "test-image.png" },
        isMediaLoading: false,
    }),
}))

jest.mock("../Hooks", () => ({
    useGasFee: () => ({
        vthoGasFee: "0.001",
        fiatValueGasFeeSpent: "$0.01",
        isLoading: false,
    }),
}))

describe("NonFungibleTokenMarketplaceDetails", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockOnCopyToClipboard.mockClear()
    })

    const mockNFTMarketplaceActivity: NFTMarketplaceActivity = {
        id: "74288e9519f1e81a5decf266c2f226a0e9436b47",
        txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
        blockNumber: 21791678,
        genesisId: genesisesId.main,
        isTransaction: false,
        type: ActivityType.NFT_SALE,
        timestamp: 1748446000000,
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        delegated: false,
        status: ActivityStatus.SUCCESS,
        from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User is seller
        to: ["0x3ca506"],
        direction: DIRECTIONS.UP,
        tokenId: "12345",
        contractAddress: "0x123abc",
        price: "2500000000000000000",
        buyer: "0x3ca506",
        seller: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User is seller
        paymentToken: "VET",
    }

    describe("when user is the seller", () => {
        it("should display 'NFT sold' as transaction type", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            // Transaction type should show "NFT sold"
            const transactionTypeValue = screen.getByTestId("nft-marketplace-detail-1-value")
            expect(transactionTypeValue).toHaveTextContent("NFT Sold")
        })

        it("should display price with UP direction", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            // Price should show with UP arrow (seller receiving money)
            const priceValue = screen.getByTestId("nft-marketplace-detail-2-value")
            expect(priceValue).toHaveTextContent("+ 2.50")

            // Payment token should be displayed
            const priceAdditional = screen.getByTestId("nft-marketplace-detail-2-additional")
            expect(priceAdditional).toHaveTextContent("≈ $100.00")
        })
    })

    describe("when user is the buyer", () => {
        const buyerActivity = {
            ...mockNFTMarketplaceActivity,
            direction: DIRECTIONS.DOWN,
            buyer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User is now the buyer
            seller: "0x3ca506",
        }

        it("should display 'NFT purchased' as transaction type", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={buyerActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            // Transaction type should show "NFT purchased"
            const transactionTypeValue = screen.getByTestId("nft-marketplace-detail-1-value")
            expect(transactionTypeValue).toHaveTextContent("NFT purchased")
        })

        it("should display price with DOWN direction", () => {
            render(<NonFungibleTokenMarketplaceDetails activity={buyerActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            // Price should show with DOWN arrow (buyer spending money)
            const priceValue = screen.getByTestId("nft-marketplace-detail-2-value")
            expect(priceValue).toHaveTextContent("- 2.50")
        })
    })

    describe("transaction details", () => {
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

            const blockNumberValue = screen.getByTestId("nft-marketplace-detail-5-value")
            expect(blockNumberValue).toHaveTextContent("21791678")
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
    })

    describe("different payment tokens", () => {
        it("should display custom payment token", () => {
            const customTokenActivity = {
                ...mockNFTMarketplaceActivity,
                paymentToken: "B3TR",
            }

            render(<NonFungibleTokenMarketplaceDetails activity={customTokenActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const priceAdditional = screen.getByTestId("nft-marketplace-detail-2-additional")
            expect(priceAdditional).toHaveTextContent("≈ $100.00")
        })

        it("should default to VET when no payment token is specified", () => {
            const noPaymentTokenActivity = {
                ...mockNFTMarketplaceActivity,
                paymentToken: undefined,
            }

            render(<NonFungibleTokenMarketplaceDetails activity={noPaymentTokenActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const priceAdditional = screen.getByTestId("nft-marketplace-detail-2-additional")
            expect(priceAdditional).toHaveTextContent("≈ $100.00")
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

        it("should handle large price values", () => {
            const largePriceActivity = {
                ...mockNFTMarketplaceActivity,
                price: "999999999999999999999999", // Very large number
            }

            render(<NonFungibleTokenMarketplaceDetails activity={largePriceActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const priceValue = screen.getByTestId("nft-marketplace-detail-2-value")
            expect(priceValue).toHaveTextContent("+ 999,999.99") // Should format large numbers properly
        })

        it("should handle missing block number", () => {
            const noBlockActivity = {
                ...mockNFTMarketplaceActivity,
                blockNumber: undefined as any,
            }

            render(<NonFungibleTokenMarketplaceDetails activity={noBlockActivity} paid="0x33450" />, {
                wrapper: TestWrapper,
            })

            const blockNumberValue = screen.getByTestId("nft-marketplace-detail-5-value")
            expect(blockNumberValue).toHaveTextContent("") // Should be empty when no block number
        })
    })
})
