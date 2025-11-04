import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { CollectibleCard } from "./CollectibleCard"
import { TestWrapper } from "~Test"

const mockedOnPress = jest.fn()

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
})
