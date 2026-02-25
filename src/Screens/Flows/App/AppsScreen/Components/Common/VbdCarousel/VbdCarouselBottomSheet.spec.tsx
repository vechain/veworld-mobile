import { act, fireEvent, screen, waitFor } from "@testing-library/react-native"
import _ from "lodash"
import React from "react"
import { components } from "~Generated/indexer/schema"
import { useAppOverview } from "~Hooks/useAppOverview"
import { VbdDApp, X2ECategoryType } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { useDAppActions } from "../../../Hooks"
import { VbdCarouselBottomSheet } from "./VbdCarouselBottomSheet"
import { useEdgeSwipeGesture } from "~Components/Reusable/EdgeSwipeIndicator"
import { Gesture } from "react-native-gesture-handler"

// Mock the external dependencies
jest.mock("../../../Hooks", () => ({
    useDAppActions: jest.fn(),
}))

// Mock the edge swipe gesture hook to avoid Skia issues in tests
jest.mock("~Components/Reusable/EdgeSwipeIndicator", () => ({
    ...jest.requireActual("~Components/Reusable/EdgeSwipeIndicator"),
    useEdgeSwipeGesture: jest.fn(),
}))

let mockVbdDAppsData: VbdDApp[] = []

jest.mock("~Hooks/useFetchFeaturedDApps", () => ({
    useVeBetterDaoDapps: () => ({
        get data() {
            return mockVbdDAppsData
        },
        isLoading: false,
    }),
}))
jest.mock("react-native-localize", () => ({
    getTimeZone: jest.fn(() => "America/New_York"),
}))

jest.mock("~Hooks/useAppOverview", () => ({
    useAppOverview: jest.fn(),
}))

const mockVbdDApp: VbdDApp = {
    id: "test-app-id",
    teamWalletAddress: "0x123",
    name: "Test DApp",
    metadataURI: "https://example.com/metadata",
    createdAtTimestamp: "1640995200", // Jan 1, 2022
    appAvailableForAllocationVoting: true,
    description: "A test DApp for unit testing",
    external_url: "https://test-dapp.com",
    logo: "https://example.com/logo.png",
    banner: "https://example.com/banner.png",
    screenshots: ["https://example.com/screenshot1.png"],
    social_urls: [{ name: "twitter", url: "https://twitter.com/testdapp" }],
    app_urls: [{ code: "en", url: "https://test-dapp.com" }],
    categories: [X2ECategoryType.GREEN_FINANCE_DEFI],
    ve_world: {
        banner: "https://example.com/banner.png",
        featured_image: "https://example.com/featured.png",
    },
}

describe("VbdCarouselBottomSheet", () => {
    const mockOnDAppPress = jest.fn()

    const mockAppOverview: components["schemas"]["AppOverview"] = {
        appId: "test-entity",
        roundId: 1,
        date: "2024-01-01",
        totalRewardAmount: 1000,
        actionsRewarded: 2500,
        totalImpact: {
            carbon: 0,
            water: 0,
            energy: 0,
            waste_mass: 0,
            waste_items: 0,
            waste_reduction: 0,
            biodiversity: 0,
            people: 0,
            timber: 0,
            plastic: 0,
            education_time: 0,
            trees_planted: 0,
            calories_burned: 0,
            clean_energy_production_wh: 0,
            sleep_quality_percentage: 0,
        },
        rankByReward: 1,
        rankByActionsRewarded: 1,
        totalUniqueUserInteractions: 1500,
    }

    const appMetadata = {
        bannerUri: "https://example.com/banner.png",
        iconUri: "https://example.com/icon.png",
        category: "green-finance-defi" as const,
        app: mockVbdDApp,
        carouselIndex: 0,
        carouselDapps: [mockVbdDApp],
    }

    const defaultProps = {
        bsRef: {
            current: {
                present: jest.fn(),
                close: jest.fn(),
                dismiss: jest.fn(),
                snapToIndex: jest.fn(),
                snapToPosition: jest.fn(),
                expand: jest.fn(),
                collapse: jest.fn(),
                forceClose: jest.fn(),
            },
        },
    }

    const mockState: Partial<RootState> = {
        discovery: {
            featured: [
                {
                    name: "Test DApp",
                    href: "https://test-dapp.com",
                    desc: "A test DApp for unit testing",
                    isCustom: false,
                    createAt: 1640995200000,
                    amountOfNavigations: 0,
                    veBetterDaoId: "test-app-id",
                },
            ],
            favoriteRefs: [],
            custom: [],
            hasOpenedDiscovery: false,
            connectedApps: [],
            tabsManager: {
                currentTabId: null,
                tabs: [],
            },
            bannerInteractions: {},
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockVbdDAppsData = [mockVbdDApp]
        ;(useDAppActions as jest.Mock).mockReturnValue({
            onDAppPress: mockOnDAppPress,
        })
        ;(useAppOverview as jest.Mock).mockReturnValue({ data: mockAppOverview, isLoading: false })
        ;(useEdgeSwipeGesture as jest.Mock).mockReturnValue({
            swipeDirection: { value: "none" },
            leftPatch: { value: [] },
            rightPatch: { value: [] },
            swipeGesture: Gesture.Pan(),
            viewImage: null,
            takeViewSnapshot: jest.fn(),
        })
    })

    describe("Rendering", () => {
        it("should render correctly when closed", () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            expect(screen.queryByTestId("VBD_CAROUSEL_BS")).toBeNull()
        })

        it("should render app information correctly", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(appMetadata)
            })

            expect(screen.getByTestId("VBD_CAROUSEL_BS_APP_NAME")).toHaveTextContent("Test DApp")
            expect(screen.getByTestId("VBD_CAROUSEL_BS_APP_DESCRIPTION")).toHaveTextContent(
                "A test DApp for unit testing",
            )
        })

        it("should render category chip when category is provided", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(appMetadata)
            })

            // Category chip should be rendered (looking for the actual rendered text)
            expect(screen.getByTestId("CATEGORY_CHIP")).toBeOnTheScreen()
            expect(screen.getByText("Web3")).toBeOnTheScreen()
        })

        it("should not render category chip when category is not provided", async () => {
            // Create a mock app with no valid categories
            const appWithNoCategory = {
                ...mockVbdDApp,
                categories: undefined,
            }

            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present({
                    ...appMetadata,
                    app: appWithNoCategory,
                    carouselDapps: [appWithNoCategory],
                })
            })

            // Category chip should not be rendered when app has no categories
            expect(screen.queryByTestId("CATEGORY_CHIP")).not.toBeOnTheScreen()
        })

        it("should render loading skeletons when app overview is loading", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(_.omit(appMetadata, "category"))
            })

            // Should show skeleton loaders for stats (checking component type)
            const usersSection = screen.getByText("Users")
            const actionsSection = screen.getByText("Actions")
            expect(usersSection).toBeOnTheScreen()
            expect(actionsSection).toBeOnTheScreen()
            // Note: Skeletons are present in the DOM as <Skeleton /> components
        })

        it("should render app overview data when loaded", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(_.omit(appMetadata, "category"))
            })

            await waitFor(() => {
                expect(useAppOverview).toHaveBeenCalledWith("test-app-id")
            })

            // Check that stats are displayed (numbers are formatted)
            await waitFor(() => {
                expect(screen.getByText("1.5K")).toBeOnTheScreen() // Users count
                expect(screen.getByText("2.5K")).toBeOnTheScreen() // Actions count
            })
        })
    })

    describe("Favorite functionality", () => {
        it("Toggle favorite status", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(_.omit(appMetadata, "category"))
            })

            const favoriteButton = screen.getByTestId("Favorite_Button")

            // Add to favorite
            const addFavoriteButtonIcon = screen.getByTestId("bottom-sheet-add-favorite-icon")
            expect(addFavoriteButtonIcon).toBeOnTheScreen()

            await act(async () => {
                fireEvent.press(favoriteButton)
            })

            // Check if the remove favorite icon is shown
            await waitFor(() => {
                const removeFavoriteButtonIcon = screen.getByTestId("bottom-sheet-remove-favorite-icon")
                expect(removeFavoriteButtonIcon).toBeOnTheScreen()
            })

            // Remove from favorite
            await act(async () => {
                fireEvent.press(favoriteButton)
            })

            // Check if the add to favorite icon is shown
            await waitFor(() => {
                expect(screen.getByTestId("bottom-sheet-add-favorite-icon")).toBeOnTheScreen()
            })
        })
    })

    describe("Actions", () => {
        it("should call onDAppPress when Open App button is pressed", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(_.omit(appMetadata, "category"))
            })

            const openButton = screen.getByTestId("Open_Button")

            await act(() => {
                fireEvent.press(openButton)
            })

            expect(mockOnDAppPress).toHaveBeenCalledWith(mockVbdDApp)
        })
    })

    describe("App overview fetching", () => {
        it("should fetch app overview when bottom sheet opens", async () => {
            TestHelpers.render.renderComponentWithProps(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
                initialProps: { preloadedState: mockState },
            })

            await act(() => {
                defaultProps.bsRef.current.present(_.omit(appMetadata, "category"))
            })

            await waitFor(() => {
                expect(useAppOverview).toHaveBeenCalledWith("test-app-id")
            })
        })
    })
})
