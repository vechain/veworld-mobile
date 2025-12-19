import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { CollectibleCard } from "./CollectibleCard"
import { TestWrapper } from "~Test"
import { useCollectibleTransferDetails } from "~Hooks/useCollectibleTransferDetails"

const mockedOnPress = jest.fn()

const mockedTransferDetails = {
    data: {
        data: [
            {
                id: "eff9719eda26cb6cd47501e045d93dcd5cf979d6",
                tokenId: "123",
                contractAddress: "0x123",
                owner: "0x2ed8565915532780365a8037c1f5911806b648e8",
                txId: "0x6d5b19fa75df917e8870e61d8cc8ab1ecbb3030bd385e88a9ab3769b07e9879b",
                blockNumber: 23560587,
                blockId: "0x0167818bbaee3997fb4778c3c64886066e6cfbac42e582d31aecd090d684f7a4",
                blockTimestamp: 1766136600,
            },
        ],
        pagination: {
            hasNext: false,
        },
    },
}

jest.mock("~Hooks/useCollectibleTransferDetails", () => ({
    useCollectibleTransferDetails: jest.fn().mockResolvedValue(() => mockedTransferDetails),
}))

describe("CollectibleCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", async () => {
        render(<CollectibleCard address="0x123" tokenId="123" onPress={mockedOnPress} />, { wrapper: TestWrapper })

        const collectibleCard = await screen.findByTestId("VBD_COLLECTIBLE_CARD_0x123_123")
        expect(collectibleCard).toBeOnTheScreen()
    })

    it("should call onPress when pressed", async () => {
        render(<CollectibleCard address="0x123" tokenId="123" onPress={mockedOnPress} />, { wrapper: TestWrapper })

        const collectibleCard = await screen.findByTestId("VBD_COLLECTIBLE_CARD_0x123_123")
        fireEvent.press(collectibleCard)
        expect(mockedOnPress).toHaveBeenCalledWith({ address: "0x123", tokenId: "123" })
    })

    it("should render the collectible even if block timestamp is not available", async () => {
        ;(useCollectibleTransferDetails as jest.Mock).mockResolvedValueOnce({
            ...mockedTransferDetails,
            data: {
                ...mockedTransferDetails.data,
                data: [{ ...mockedTransferDetails.data.data[0], blockTimestamp: undefined }],
            },
        })
        render(<CollectibleCard address="0x123" tokenId="123" onPress={mockedOnPress} />, { wrapper: TestWrapper })

        const collectibleCard = await screen.findByTestId("VBD_COLLECTIBLE_CARD_0x123_123")
        expect(collectibleCard).toBeOnTheScreen()
    })
})
