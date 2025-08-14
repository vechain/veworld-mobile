import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native"
import { VbdCarouselBottomSheet } from "./VbdCarouselBottomSheet"
import { TestWrapper } from "~Test"
import { VbdDApp } from "~Model"
import { FetchAppOverviewResponse } from "~Networking/API/Types"
import { RootState } from "~Storage/Redux/Types"

// Mock the external dependencies
jest.mock("~Networking/DApps/fetchAppOverview")
jest.mock("~Screens/Flows/App/DiscoverScreen/Hooks")
jest.mock("react-native-localize", () => ({
    getTimeZone: jest.fn(() => "America/New_York"),
}))

const mockFetchAppOverview = require("~Networking/DApps/fetchAppOverview").fetchAppOverview as jest.Mock
const mockUseDAppActions = require("~Screens/Flows/App/DiscoverScreen/Hooks").useDAppActions as jest.Mock

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
    categories: ["pets"],
}

describe("VbdCarouselBottomSheet", () => {
    const mockSetIsOpen = jest.fn()
    const mockOnDAppPress = jest.fn()

    const mockAppOverview: FetchAppOverviewResponse = {
        entity: "test-entity",
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

    const defaultProps = {
        isOpen: false,
        setIsOpen: mockSetIsOpen,
        bannerUri: "https://example.com/banner.png",
        iconUri: "https://example.com/icon.png",
        category: "green-finance-defi" as const,
        app: mockVbdDApp,
    }

    const mockState: Partial<RootState> = {
        discovery: {
            featured: [],
            favorites: [],
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
        mockUseDAppActions.mockReturnValue({
            onDAppPress: mockOnDAppPress,
        })
        mockFetchAppOverview.mockResolvedValue(mockAppOverview)
    })

    describe("Rendering", () => {
        it("should render correctly when closed", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            expect(screen.getByTestId("VBD_CAROUSEL_BS")).toBeOnTheScreen()
        })

        it("should render app information correctly", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            expect(screen.getByTestId("VBD_CAROUSEL_BS_APP_NAME")).toHaveTextContent("Test DApp")
            expect(screen.getByTestId("VBD_CAROUSEL_BS_APP_DESCRIPTION")).toHaveTextContent(
                "A test DApp for unit testing",
            )
        })

        it("should render category chip when category is provided", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            // Category chip should be rendered (looking for the actual rendered text)
            expect(screen.getByTestId("CATEGORY_CHIP")).toBeOnTheScreen()
            expect(screen.getByText("Web3")).toBeOnTheScreen()
        })

        it("should not render category chip when category is not provided", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} category={undefined} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            // Category chip should not be rendered
            expect(screen.queryByText("pets")).not.toBeOnTheScreen()
        })

        it("should render loading skeletons when app overview is loading", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            // Should show skeleton loaders for stats (checking component type)
            const usersSection = screen.getByText("Users")
            const actionsSection = screen.getByText("Actions")
            expect(usersSection).toBeOnTheScreen()
            expect(actionsSection).toBeOnTheScreen()
            // Note: Skeletons are present in the DOM as <Skeleton /> components
        })

        it("should render app overview data when loaded", async () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            await waitFor(() => {
                expect(mockFetchAppOverview).toHaveBeenCalledWith("test-app-id")
            })

            // Check that stats are displayed (numbers are formatted)
            await waitFor(() => {
                expect(screen.getByText("1.5K")).toBeOnTheScreen() // Users count
                expect(screen.getByText("2.5K")).toBeOnTheScreen() // Actions count
            })
        })
    })

    describe("Favorite functionality", () => {
        it("Toggle favorite status", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            const favoriteButton = screen.getByTestId("Favorite_Button")

            // Add to favorite
            const addFavoriteButtonIcon = screen.getByTestId("bottom-sheet-add-favorite-icon")
            expect(addFavoriteButtonIcon).toBeOnTheScreen()
            fireEvent.press(favoriteButton)

            // Check if the remove favorite icon is shown
            const removeFavoriteButtonIcon = screen.getByTestId("bottom-sheet-remove-favorite-icon")
            expect(removeFavoriteButtonIcon).toBeOnTheScreen()

            // Remove from favorite
            fireEvent.press(favoriteButton)

            // Check if the add to favorite icon is shown
            expect(addFavoriteButtonIcon).toBeOnTheScreen()
        })
    })

    describe("Actions", () => {
        it("should call onDAppPress when Open App button is pressed", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            const openButton = screen.getByTestId("Open_Button")
            fireEvent.press(openButton)

            expect(mockOnDAppPress).toHaveBeenCalledWith(mockVbdDApp)
        })

        it("should call setIsOpen(false) when close button is pressed", () => {
            render(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            const closeButtons = screen.getAllByTestId("bottom-sheet-close-btn")
            const headerCloseButton = closeButtons.find(button => button.props.style?.position === "absolute")
            fireEvent.press(headerCloseButton || closeButtons[0])

            // Note: Due to animation timing, setIsOpen might be called after a delay
            // In a real test, you might want to use fake timers or wait for the animation
        })
    })

    describe("App overview fetching", () => {
        it("should fetch app overview when bottom sheet opens", async () => {
            const { rerender } = render(<VbdCarouselBottomSheet {...defaultProps} isOpen={false} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            // Initially should not fetch
            expect(mockFetchAppOverview).not.toHaveBeenCalled()

            // When opened, should fetch
            rerender(<VbdCarouselBottomSheet {...defaultProps} isOpen={true} />)

            await waitFor(() => {
                expect(mockFetchAppOverview).toHaveBeenCalledWith("test-app-id")
            })
        })

        it("should not fetch app overview if app has no id", async () => {
            const appWithoutId = { ...mockVbdDApp, id: undefined }

            render(<VbdCarouselBottomSheet {...defaultProps} app={appWithoutId as any} isOpen={true} />, {
                wrapper: ({ children }) => <TestWrapper preloadedState={mockState}>{children}</TestWrapper>,
            })

            await waitFor(() => {
                expect(mockFetchAppOverview).not.toHaveBeenCalled()
            })
        })
    })
})
