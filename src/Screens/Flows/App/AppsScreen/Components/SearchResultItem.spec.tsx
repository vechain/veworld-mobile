import { useNavigation } from "@react-navigation/native"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import React, { useRef } from "react"
import { useVisitedUrls } from "~Hooks/useBrowserSearch"
import { Routes } from "~Navigation"
import { TestWrapper } from "~Test"
import { HistoryUrlKind } from "~Utils/HistoryUtils"
import { useDAppActions } from "../Hooks"
import { SearchResultItem } from "./SearchResultItem"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { renderHook } from "@testing-library/react-hooks"

jest.mock("../Hooks")
jest.mock("~Hooks/useBrowserSearch")
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

describe("SearchResultItem", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it("Should render HistoryUrlKind.URL correctly", async () => {
        const onDAppPress = jest.fn()
        const navigate = jest.fn()
        ;(useDAppActions as jest.Mock).mockReturnValue({ onDAppPress })
        ;(useVisitedUrls as jest.Mock).mockReturnValue({ removeVisitedUrl: jest.fn() })
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigate })
        const { result } = renderHook(() => useRef<Map<string, SwipeableItemImperativeRef>>(new Map()))
        render(
            <SearchResultItem
                item={{ type: HistoryUrlKind.URL, name: "TEST", url: "https://vechain.org" }}
                swipeableItemRefs={result.current}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const name = screen.getByTestId("SEARCH_RESULT_ITEM_NAME")
        const description = screen.getByTestId("SEARCH_RESULT_ITEM_DESCRIPTION")
        const container = screen.getByTestId("SEARCH_RESULT_ITEM_CONTAINER")
        expect(name).toHaveTextContent("TEST")
        expect(description).toHaveTextContent("vechain.org")

        act(() => {
            fireEvent.press(container)
        })

        await waitFor(() => {
            expect(onDAppPress).not.toHaveBeenCalled()
            expect(navigate).toHaveBeenCalledWith(Routes.BROWSER, { url: "https://vechain.org" })
        })
    })

    it("Should render HistoryUrlKind.DAPP correctly", async () => {
        const onDAppPress = jest.fn()
        const navigate = jest.fn()
        const dappDescription =
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita iusto aliquam inventore?"
        ;(useDAppActions as jest.Mock).mockReturnValue({ onDAppPress })
        ;(useVisitedUrls as jest.Mock).mockReturnValue({
            removeVisitedUrl: jest.fn(),
            addVisitedUrl: jest.fn(),
        })
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigate })
        const { result } = renderHook(() => useRef<Map<string, SwipeableItemImperativeRef>>(new Map()))
        const dapp = {
            amountOfNavigations: 0,
            createAt: Date.now(),
            href: "https://vechain.org",
            isCustom: false,
            name: "TEST",
            desc: dappDescription,
        }
        render(
            <SearchResultItem
                item={{
                    type: HistoryUrlKind.DAPP,
                    dapp,
                }}
                swipeableItemRefs={result.current}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const name = screen.getByTestId("SEARCH_RESULT_ITEM_NAME")
        const description = screen.getByTestId("SEARCH_RESULT_ITEM_DESCRIPTION")
        const container = screen.getByTestId("SEARCH_RESULT_ITEM_CONTAINER")
        expect(name).toHaveTextContent("TEST")
        expect(description).toHaveTextContent("vechain.org")

        act(() => {
            fireEvent.press(container)
        })

        await waitFor(() => {
            expect(onDAppPress).toHaveBeenCalledWith(dapp)
            expect(navigate).not.toHaveBeenCalled()
        })
    })

    it("Should render fallback if url is valid, but the image doesn't load correctly", async () => {
        ;(useDAppActions as jest.Mock).mockReturnValue({ onDAppPress: jest.fn() })
        ;(useVisitedUrls as jest.Mock).mockReturnValue({ removeVisitedUrl: jest.fn() })
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() })
        const { result } = renderHook(() => useRef<Map<string, SwipeableItemImperativeRef>>(new Map()))
        render(
            <SearchResultItem
                item={{ type: HistoryUrlKind.URL, name: "TEST", url: "https://vechain.org" }}
                swipeableItemRefs={result.current}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const imageContainer = screen.getByTestId("SEARCH_RESULT_ITEM_IMAGE")
        act(() => {
            fireEvent(imageContainer, "error")
        })

        const iconContainer = screen.getByTestId("SEARCH_RESULT_ITEM_FALLBACK_ICON")
        await waitFor(() => {
            expect(iconContainer).toBeVisible()
        })
    })
})
