import { screen } from "@testing-library/react-native"
import React from "react"
import { SearchResults } from "./SearchResults"
import { TestWrapper, TestHelpers } from "~Test"
import { HistoryUrlItem, HistoryUrlKind } from "~Utils/HistoryUtils"
import { SearchError } from "~Hooks"

const { renderComponentWithProps } = TestHelpers.render

jest.mock("~Components/Providers/InAppBrowserProvider", () => ({
    ...jest.requireActual("~Components/Providers/InAppBrowserProvider"),
    useInAppBrowser: jest.fn().mockReturnValue({
        navigationState: {
            index: 0,
            routes: [],
        },
    }),
}))

describe("SearchResults", () => {
    it("should render correctly", () => {
        const historyItem: HistoryUrlItem = {
            type: HistoryUrlKind.URL,
            url: "https://www.google.com",
            name: "Google",
        }

        renderComponentWithProps(<SearchResults results={[historyItem]} isExactMatch={false} isValidQuery={false} />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    browser: {
                        visitedUrls: [
                            {
                                id: "1",
                                createAt: Date.now(),
                                href: "https://www.google.com",
                                title: "Google",
                                name: "Google",
                                isCustom: false,
                                amountOfNavigations: 0,
                            },
                        ],
                    },
                },
            },
        })

        const defaultTitle = screen.getByTestId("search-results-default-title")
        expect(defaultTitle).toBeOnTheScreen()
    })

    it("should render correctly with no results", () => {
        renderComponentWithProps(<SearchResults results={[]} isExactMatch={false} isValidQuery={false} />, {
            wrapper: TestWrapper,
        })

        const emptyTitle = screen.getByTestId("search-results-empty-title")
        expect(emptyTitle).toBeOnTheScreen()
    })

    it("should render correctly with valid query and no results", () => {
        renderComponentWithProps(<SearchResults results={[]} isExactMatch={false} isValidQuery={true} />, {
            wrapper: TestWrapper,
        })

        const noResultsTitle = screen.getByTestId("search-no-results-title")
        expect(noResultsTitle).toBeOnTheScreen()
    })

    it("should render correctly with valid query and results", () => {
        renderComponentWithProps(
            <SearchResults
                results={[
                    {
                        type: HistoryUrlKind.URL,
                        url: "https://www.google.com",
                        name: "Google",
                    },
                ]}
                isExactMatch={false}
                isValidQuery={true}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const resultsTitle = screen.getByTestId("search-results-title")
        expect(resultsTitle).toBeOnTheScreen()

        const foundTitle = screen.queryByTestId("search-results-found-title")
        expect(foundTitle).toBeNull()
    })

    it("should render correctly with valid query and results and exact match", () => {
        renderComponentWithProps(
            <SearchResults
                results={[
                    {
                        type: HistoryUrlKind.DAPP,
                        dapp: {
                            href: "https://mugshot.vet",
                            name: "Mugshot",
                            createAt: Date.now(),
                            isCustom: false,
                            amountOfNavigations: 0,
                        },
                    },
                ]}
                isExactMatch={true}
                isValidQuery={true}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const foundTitle = screen.getByTestId("search-results-found-title")
        expect(foundTitle).toBeOnTheScreen()

        const resultsTitle = screen.queryByTestId("search-results-title")
        expect(resultsTitle).toBeNull()
    })

    it("should render correctly with error", () => {
        renderComponentWithProps(
            <SearchResults
                results={[]}
                isExactMatch={false}
                isValidQuery={true}
                error={SearchError.ADDRESS_CANNOT_BE_REACHED}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const errorTitle = screen.getByTestId("search-results-address-error")
        expect(errorTitle).toBeOnTheScreen()
    })
})
