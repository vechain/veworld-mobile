import { render, screen } from "@testing-library/react-native"
import React from "react"
import { useVns } from "~Hooks/useVns"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { TestWrapper } from "~Test"
import { AddressUtils } from "~Utils"
import { useNFTSendContext } from "~Components/Reusable/Send"
import { NFTReceiverCard } from "./NFTReceiverCard"

jest.mock("~Components/Reusable/Send", () => ({
    useNFTSendContext: jest.fn(),
}))

jest.mock("~Hooks/useCollectibleDetails")

jest.mock("~Hooks/useVns")

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

describe("NFTReceiverCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useVns as jest.Mock).mockReturnValue({ name: "", address: "" })
    })

    it("renders loading skeleton when collection name is undefined", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue({
            collectionName: undefined,
        })

        render(<NFTReceiverCard />, { wrapper: TestWrapper })

        expect(screen.queryByText("Cool Collection")).toBeNull()
        expect(screen.queryByText("#12345")).toBeNull()
    })

    it("renders NFT collection name and token ID when loaded", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue(mockCollectibleDetails)

        render(<NFTReceiverCard />, { wrapper: TestWrapper })

        expect(screen.getByText("Cool Collection")).toBeTruthy()
        expect(screen.getByText("#12345")).toBeTruthy()
    })

    it("renders receiver address in hex format when no VNS", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue(mockCollectibleDetails)
        ;(useVns as jest.Mock).mockReturnValue({ name: "", address: "" })

        render(<NFTReceiverCard />, { wrapper: TestWrapper })

        const formattedAddress = AddressUtils.showAddressOrName(
            mockFlowState.address,
            { name: "", address: "" },
            { ellipsed: true, lengthBefore: 4, lengthAfter: 6 },
        )

        const addressElement = await screen.findByText(formattedAddress)
        expect(addressElement).toBeTruthy()
    })

    it("renders VNS domain name when available", async () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue(mockCollectibleDetails)
        ;(useVns as jest.Mock).mockReturnValue({ name: "alice.vet", address: mockFlowState.address })

        render(<NFTReceiverCard />, { wrapper: TestWrapper })

        const vnsAddress = AddressUtils.showAddressOrName(
            mockFlowState.address,
            { name: "alice.vet", address: mockFlowState.address },
            { ellipsed: true, lengthBefore: 4, lengthAfter: 6 },
        )

        const addressElement = await screen.findByText(vnsAddress)
        expect(addressElement).toBeTruthy()
    })

    it("shows 'Unknown Collection' fallback when collection name is missing", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue({
            ...mockCollectibleDetails,
            collectionName: undefined,
        })

        render(<NFTReceiverCard />, { wrapper: TestWrapper })

        expect(screen.queryByText("Unknown Collection")).toBeNull()
    })

    it("properly displays token ID with # prefix", () => {
        ;(useNFTSendContext as jest.Mock).mockReturnValue({
            flowState: mockFlowState,
        })
        ;(useCollectibleDetails as jest.Mock).mockReturnValue(mockCollectibleDetails)

        render(<NFTReceiverCard />, { wrapper: TestWrapper })

        const tokenIdElement = screen.getByText("#12345")
        expect(tokenIdElement).toBeTruthy()
    })
})
