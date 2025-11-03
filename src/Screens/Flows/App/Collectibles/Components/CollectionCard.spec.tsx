import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { CollectionCard } from "./CollectionCard"
import { TestWrapper } from "~Test"

const mockedOnPress = jest.fn()

describe("CollectionCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", () => {
        render(<CollectionCard collectionAddress="0x123" onPress={mockedOnPress} onToggleFavorite={jest.fn()} />, {
            wrapper: TestWrapper,
        })
        expect(screen.getByTestId("VBD_COLLECTION_CARD_0x123")).toBeOnTheScreen()
    })

    it("should call onPress when pressed", async () => {
        render(<CollectionCard collectionAddress="0x123" onPress={mockedOnPress} onToggleFavorite={jest.fn()} />, {
            wrapper: TestWrapper,
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("VBD_COLLECTION_CARD_0x123"))
        })
        expect(mockedOnPress).toHaveBeenCalledWith("0x123")
    })
})
