import { render } from "@testing-library/react-native"
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
}))

jest.mock("../Hooks", () => ({
    useGasFee: () => ({
        gasFee: "0.001",
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
        from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        to: ["0x3ca506"],
        direction: DIRECTIONS.UP,
        tokenId: "12345",
        contractAddress: "0x123abc",
        price: "2500000000000000000",
        buyer: "0x3ca506",
        seller: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        paymentToken: "VET",
    }

    it("should render the component without crashing", () => {
        const { toJSON } = render(
            <NonFungibleTokenMarketplaceDetails activity={mockNFTMarketplaceActivity} paid="0x33450" />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(toJSON()).toBeTruthy()
    })

    it("should handle different activity directions", () => {
        const buyerActivity = {
            ...mockNFTMarketplaceActivity,
            direction: DIRECTIONS.DOWN,
        }

        const { toJSON } = render(<NonFungibleTokenMarketplaceDetails activity={buyerActivity} paid="0x33450" />, {
            wrapper: TestWrapper,
        })

        expect(toJSON()).toBeTruthy()
    })

    it("should handle different payment tokens", () => {
        const customTokenActivity = {
            ...mockNFTMarketplaceActivity,
            paymentToken: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        }

        const { toJSON } = render(
            <NonFungibleTokenMarketplaceDetails activity={customTokenActivity} paid="0x33450" />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(toJSON()).toBeTruthy()
    })

    it("should handle testnet activities", () => {
        const testnetActivity = {
            ...mockNFTMarketplaceActivity,
            genesisId: genesisesId.test,
        }

        const { toJSON } = render(<NonFungibleTokenMarketplaceDetails activity={testnetActivity} paid="0x33450" />, {
            wrapper: TestWrapper,
        })

        expect(toJSON()).toBeTruthy()
    })

    it("should handle zero price", () => {
        const zeroPriceActivity = {
            ...mockNFTMarketplaceActivity,
            price: "0",
        }

        const { toJSON } = render(<NonFungibleTokenMarketplaceDetails activity={zeroPriceActivity} paid="0x33450" />, {
            wrapper: TestWrapper,
        })

        expect(toJSON()).toBeTruthy()
    })

    it("should handle large price values", () => {
        const largePriceActivity = {
            ...mockNFTMarketplaceActivity,
            price: "999999999999999999999999",
        }

        const { toJSON } = render(<NonFungibleTokenMarketplaceDetails activity={largePriceActivity} paid="0x33450" />, {
            wrapper: TestWrapper,
        })

        expect(toJSON()).toBeTruthy()
    })

    it("should handle missing block number", () => {
        const noBlockActivity = {
            ...mockNFTMarketplaceActivity,
            blockNumber: undefined as any,
        }

        const { toJSON } = render(<NonFungibleTokenMarketplaceDetails activity={noBlockActivity} paid="0x33450" />, {
            wrapper: TestWrapper,
        })

        expect(toJSON()).toBeTruthy()
    })
})
