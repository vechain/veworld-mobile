import { useNavigation } from "@react-navigation/native"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { useHomeCollectibles } from "~Hooks/useHomeCollectibles"
import { Routes } from "~Navigation"
import { useNFTCollections } from "~Screens/Flows/App/Collectibles/Hooks"
import { TestWrapper } from "~Test"
import { CollectiblesList } from "./CollectiblesList"

jest.mock("~Screens/Flows/App/Collectibles/Hooks", () => ({
    useNFTCollections: jest.fn(),
}))

jest.mock("~Hooks/useHomeCollectibles", () => ({
    useHomeCollectibles: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

describe("CollectiblesList", () => {
    it("should redirect correctly for one collectible", async () => {
        ;(useHomeCollectibles as jest.Mock).mockReturnValue({
            data: {
                data: [
                    {
                        contractAddress: "0x0",
                        tokenId: "1",
                    },
                ],
                pagination: {},
            },
        })
        ;(useNFTCollections as jest.Mock).mockReturnValue({
            data: {
                pages: [
                    {
                        data: ["0x0"],
                    },
                ],
            },
        })
        const navigator = { navigate: jest.fn() }
        ;(useNavigation as jest.Mock).mockReturnValue(navigator)
        render(<CollectiblesList />, { wrapper: TestWrapper })

        const collectiblesList = await screen.findByTestId("COLLECTIBLES_LIST")
        expect(collectiblesList).toBeOnTheScreen()

        act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_LIST_SEE_ALL"))
        })

        expect(navigator.navigate).toHaveBeenCalledWith(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
            collectionAddress: "0x0",
        })
    })
    it("should redirect correctly for multiple collectibles", async () => {
        ;(useHomeCollectibles as jest.Mock).mockReturnValue({
            data: {
                data: [
                    {
                        contractAddress: "0x0",
                        tokenId: "1",
                    },
                ],
                pagination: {},
            },
        })
        ;(useNFTCollections as jest.Mock).mockReturnValue({
            data: {
                pages: [
                    {
                        data: ["0x0", "0x1"],
                    },
                ],
            },
        })
        const navigator = { navigate: jest.fn() }
        ;(useNavigation as jest.Mock).mockReturnValue(navigator)
        render(<CollectiblesList />, { wrapper: TestWrapper })

        const collectiblesList = await screen.findByTestId("COLLECTIBLES_LIST")
        expect(collectiblesList).toBeOnTheScreen()

        act(() => {
            fireEvent.press(screen.getByTestId("COLLECTIBLES_LIST_SEE_ALL"))
        })

        expect(navigator.navigate).toHaveBeenCalledWith(Routes.COLLECTIBLES_COLLECTIONS)
    })
})
