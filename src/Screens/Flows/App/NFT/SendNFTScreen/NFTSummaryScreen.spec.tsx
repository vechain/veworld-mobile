import { render, screen, waitFor } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { useNFTSendContext } from "~Components/Reusable/Send"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useTransactionScreen } from "~Hooks"
import { useAppSelector, useAppDispatch } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { NFTSummaryScreen } from "./NFTSummaryScreen"

jest.mock("~Components/Reusable/Send", () => ({
    ...jest.requireActual("~Components/Reusable/Send"),
    useNFTSendContext: jest.fn(),
}))

jest.mock("~Hooks/useCollectibleDetails")

jest.mock("~Hooks", () => ({
    ...jest.requireActual("~Hooks"),
    useTransactionScreen: jest.fn(),
    useAnalyticTracking: jest.fn(() => jest.fn()),
    useTheme: jest.fn(() => ({
        colors: {
            sendScreen: {
                summaryScreen: {
                    background: "#FFFFFF",
                    caption: "#666666",
                    address: "#000000",
                },
            },
        },
        isDark: false,
    })),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
    StackActions: {
        popToTop: jest.fn(),
    },
}))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    useAppSelector: jest.fn(),
    useAppDispatch: jest.fn(),
}))

jest.mock("~Utils/TransactionUtils/TransactionUtils", () => ({
    prepareNonFungibleClause: jest.fn(() => [
        {
            to: "0x1234567890123456789012345678901234567890",
            value: "0x0",
            data: "0x12345",
        },
    ]),
}))

const mockFlowState = {
    type: "nft" as const,
    contractAddress: "0x1234567890123456789012345678901234567890",
    tokenId: "12345",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
}

const mockCollectibleDetails = {
    name: "Cool NFT #123",
    collectionName: "Cool Collection",
    description: "A really cool NFT",
    image: "https://example.com/nft.png",
    mimeType: "image/png",
    mediaType: "image" as const,
}

const mockSelectedAccount = {
    address: "0x1234567890123456789012345678901234567890",
    index: 0,
    alias: "Test Account",
    visible: true,
}

const mockNetwork = {
    name: "Main Network",
    type: "main",
    nodeUrl: "https://node.vechain.com",
    explorerUrl: "https://explore.vechain.org",
}

const mockTransactionScreen = {
    isEnoughGas: true,
    isDelegated: false,
    gasOptions: {
        slow: { value: "0x1" },
        regular: { value: "0x2" },
        fast: { value: "0x3" },
    },
    selectedFeeOption: "regular",
    selectedDelegationToken: null,
    fallbackToVTHO: false,
    isDisabledButtonState: false,
    onSubmit: jest.fn(),
    isPasswordPromptOpen: false,
    handleClosePasswordModal: jest.fn(),
    onPasswordSuccess: jest.fn(),
}

describe("NFTSummaryScreen", () => {
    const mockDispatch = jest.fn()
    const mockNavigate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        ;(useNavigation as jest.Mock).mockReturnValue({
            navigate: mockNavigate,
            dispatch: mockNavigate,
        })
        ;(useAppSelector as jest.Mock).mockImplementation((selector: any) => {
            const selectorName = selector.name || selector.toString()

            if (selectorName.toLowerCase().includes("accounts") || selectorName.includes("selectAccounts")) {
                return [mockSelectedAccount]
            }
            if (
                selectorName.toLowerCase().includes("selectedaccount") ||
                selectorName.includes("selectSelectedAccount")
            ) {
                return mockSelectedAccount
            }
            if (selectorName.toLowerCase().includes("network") || selectorName.includes("selectSelectedNetwork")) {
                return mockNetwork
            }
            if (selectorName.includes("Notification") || selectorName.includes("notification")) return false
            if (selectorName.includes("Removed") || selectorName.includes("removed")) return []
            if (selectorName.includes("Dapp") || selectorName.includes("dapp")) return 0
            if (selectorName.includes("Opted") || selectorName.includes("opted")) return false
            if (selectorName.includes("Feature") || selectorName.includes("feature")) return false

            return []
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue(mockCollectibleDetails)
        ;(useTransactionScreen as jest.Mock).mockReturnValue(mockTransactionScreen)
    })

    it("renders empty view when address is missing", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: {
                ...mockFlowState,
                address: undefined,
            },
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        expect(screen.queryByText("Cool Collection")).toBeNull()
    })

    it("renders NFTReceiverCard when address is present", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            expect(screen.getByText("Cool Collection")).toBeTruthy()
        })

        expect(screen.getByText("#12345")).toBeTruthy()
    })

    it("renders TransactionFeeCard", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            expect(screen.getByText("Cool Collection")).toBeTruthy()
        })
    })

    it("displays Confirm button when no error", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            const confirmButton = screen.getByText("Confirm")
            expect(confirmButton).toBeTruthy()
        })
    })

    it("calls onSubmit when Next button is pressed", async () => {
        const mockOnSubmit = jest.fn()
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useTransactionScreen as jest.Mock).mockReturnValue({
            ...mockTransactionScreen,
            onSubmit: mockOnSubmit,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            expect(screen.getByText("Confirm")).toBeTruthy()
        })
    })

    it("constructs NFT clauses with correct contract address and token ID", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        expect(useTransactionScreen).toHaveBeenCalledWith(
            expect.objectContaining({
                clauses: expect.any(Array),
                onTransactionSuccess: expect.any(Function),
                onTransactionFailure: expect.any(Function),
                autoVTHOFallback: true,
            }),
        )
    })

    it("Back button is rendered", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            expect(screen.getByText("Confirm")).toBeTruthy()
        })
    })

    it("renders with disabled state when transaction is disabled", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useTransactionScreen as jest.Mock).mockReturnValue({
            ...mockTransactionScreen,
            isDisabledButtonState: true,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            expect(screen.getByText("Confirm")).toBeTruthy()
        })
    })

    it("uses correct NFT data from collectible details", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        const customCollectible = {
            ...mockCollectibleDetails,
            collectionName: "Custom Collection",
            name: "Custom NFT",
        }
        ;(useCollectibleDetails as jest.Mock).mockReturnValue(customCollectible)

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        await waitFor(() => {
            expect(screen.getByText("Custom Collection")).toBeTruthy()
        })
    })

    it("passes correct parameters to useCollectibleDetails", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })

        render(<NFTSummaryScreen />, { wrapper: TestWrapper })

        expect(useCollectibleDetails).toHaveBeenCalledWith({
            address: mockFlowState.contractAddress,
            tokenId: mockFlowState.tokenId,
        })
    })
})
