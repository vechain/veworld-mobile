import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { VbdCarouselItem } from "./VbdCarouselItem"

// Mock safe area for tests
jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context")
    return {
        ...actual,
        SafeAreaProvider: ({ children }: any) => children,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    }
})

beforeAll(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.runOnlyPendingTimers()
})

afterAll(() => {
    jest.useRealTimers()
})

describe("VbdCarouselItem", () => {
    it("should render a normal dapp", () => {
        render(
            <VbdCarouselItem
                app={{
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: Math.floor(Date.now() / 1000).toString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "ID",
                    logo: "https://google.com",
                    metadataURI: "metadata_uri",
                    name: "TEST APP",
                    screenshots: [],
                    social_urls: [],
                    teamWalletAddress: "",
                    appAvailableForAllocationVoting: true,
                    categories: [],
                    tweets: [],
                    ve_world: { banner: "https://vechain.org" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("VBD_CAROUSEL_ITEM_APP_NAME")).toHaveTextContent("TEST APP")
        expect(screen.getByTestId("VBD_CAROUSEL_ITEM_APP_DESCRIPTION")).toHaveTextContent("TEST DESCRIPTION")
        expect(screen.queryByTestId("CATEGORY_CHIP")).toBeNull()
    })

    it("should render category if it is there", () => {
        render(
            <VbdCarouselItem
                app={{
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: Math.floor(Date.now() / 1000).toString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "ID",
                    logo: "https://google.com",
                    metadataURI: "metadata_uri",
                    name: "TEST APP",
                    screenshots: [],
                    social_urls: [],
                    teamWalletAddress: "",
                    appAvailableForAllocationVoting: true,
                    categories: ["education-learning"],
                    tweets: [],
                    ve_world: { banner: "https://vechain.org" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getAllByTestId("CATEGORY_CHIP")[0]).toBeVisible()
    })

    it("should not render an unknown category", () => {
        render(
            <VbdCarouselItem
                app={{
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: Math.floor(Date.now() / 1000).toString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "ID",
                    logo: "https://google.com",
                    metadataURI: "metadata_uri",
                    name: "TEST APP",
                    screenshots: [],
                    social_urls: [],
                    teamWalletAddress: "",
                    appAvailableForAllocationVoting: true,
                    categories: ["education-learning-test"],
                    tweets: [],
                    ve_world: { banner: "https://vechain.org" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.queryByTestId("CATEGORY_CHIP")).toBeNull()
    })
})
