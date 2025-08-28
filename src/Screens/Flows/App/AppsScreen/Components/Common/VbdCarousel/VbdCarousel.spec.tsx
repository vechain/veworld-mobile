import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"

import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VbdCarousel } from "./VbdCarousel"

jest.mock("~Hooks/useFetchFeaturedDApps", () => ({
    ...jest.requireActual("~Hooks/useFetchFeaturedDApps"),
    useVeBetterDaoDapps: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
    useNavigationState: jest.fn(),
}))

// Provide safe defaults for safe area in tests
jest.mock("react-native-safe-area-context", () => {
    const actual = jest.requireActual("react-native-safe-area-context")
    return {
        ...actual,
        SafeAreaProvider: ({ children }: any) => children,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    }
})

describe("VbdCarousel", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })
    it("should render items if loaded", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [
                {
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: Math.floor(Date.now() / 1000).toString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
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
                },
            ],
        })
        render(
            <VbdCarousel
                appIds={["0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a"]}
                isLoading={false}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("VBD_CAROUSEL_ITEM")).toBeVisible()
        expect(screen.queryByTestId("VBD_CAROUSEL_ITEM_SKELETON")).toBeNull()
    })
    it("should render skeleton if apps are not loaded", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        })
        render(
            <VbdCarousel
                appIds={["0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a"]}
                isLoading={false}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("VBD_CAROUSEL_ITEM_SKELETON")).toBeVisible()
        expect(screen.queryByTestId("VBD_CAROUSEL_ITEM")).toBeNull()
    })
    it("should render skeleton if top level loading is false", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [
                {
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: Math.floor(Date.now() / 1000).toString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
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
                },
            ],
            isLoading: false,
        })
        render(
            <VbdCarousel
                appIds={["0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a"]}
                isLoading={true}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("VBD_CAROUSEL_ITEM_SKELETON")).toBeVisible()
        expect(screen.queryByTestId("VBD_CAROUSEL_ITEM")).toBeNull()
    })
})
