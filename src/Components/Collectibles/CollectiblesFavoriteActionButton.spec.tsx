import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"

import { TestWrapper } from "~Test"
import { CollectiblesFavoriteActionButton } from "./CollectiblesFavoriteActionButton"

const toggleFavorite = jest.fn().mockImplementation(payload => ({ type: "nft/toggleFavorite", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    toggleFavorite: (...args: any[]) => toggleFavorite(...args),
}))

describe("CollectiblesFavoriteActionButton", () => {
    it("should navigate to the send", async () => {
        render(<CollectiblesFavoriteActionButton address="0x0" tokenId="1" />, {
            wrapper: TestWrapper,
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_ACTION_FAVORITE"))
        })

        expect(toggleFavorite).toHaveBeenCalledWith({
            address: "0x0",
            genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
            owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
            tokenId: "1",
        })
    })
})
