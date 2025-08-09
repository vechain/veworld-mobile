import { fireEvent, render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { RowDetails } from "./RowDetails"
import { RowExpandableDetails } from "./RowExpandableDetails"

const mockUseX2EAppAnimation = jest.fn()

jest.mock("./Hooks/useX2EAppAnimation", () => ({
    useX2EAppAnimation: (props: any) => mockUseX2EAppAnimation(props),
}))

mockUseX2EAppAnimation.mockReturnValue({
    state: {
        showDetails: false,
        isAnimating: false,
        contentVisible: false,
    },
    handlers: {
        toggleDetails: jest.fn(),
        onPressIn: jest.fn(),
        onPressOut: jest.fn(),
    },
    styles: {
        containerStyle: {},
        fontStyle: {},
        imageStyle: {},
        detailsStyle: {},
        descriptionStyle: {},
        categoryLabelStyle: {},
        pressAnimationStyle: {},
        chevronStyle: {},
        spacerStyle: {},
    },
    animationProgress: { value: 0 },
})

const Wrapper = ({ children }: PropsWithChildren) => (
    <TestWrapper
        preloadedState={{
            discovery: {
                featured: [],
                bannerInteractions: {},
                connectedApps: [],
                custom: [],
                favorites: [],
                hasOpenedDiscovery: true,
                tabsManager: {
                    currentTabId: null,
                    tabs: [],
                },
            },
        }}>
        {children}
    </TestWrapper>
)

describe("RowDetails", () => {
    const mockApp = {
        name: "Test App",
        icon: "https://example.com/icon.png",
        desc: "A test application description",
        categories: ["Food & Drink", "Lifestyle"],
    }

    const mockOnToggleFavorite = jest.fn()
    const mockOnToggleOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseX2EAppAnimation.mockReturnValue({
            state: {
                showDetails: false,
                isAnimating: false,
                contentVisible: false,
            },
            handlers: {
                toggleDetails: jest.fn(),
                onPressIn: jest.fn(),
                onPressOut: jest.fn(),
            },
            styles: {
                containerStyle: {},
                fontStyle: {},
                imageStyle: {},
                detailsStyle: {},
                categoryLabelStyle: {},
                pressAnimationStyle: {},
                chevronStyle: {},
                spacerStyle: {},
            },
            animationProgress: { value: 0 },
        })
    })

    describe("Basic Rendering", () => {
        it("should render app name and description", () => {
            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    categories={mockApp.categories}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(mockApp.name)).toBeVisible()
            expect(screen.getByText(mockApp.desc)).toBeVisible()
        })

        it("should handle missing description", () => {
            render(<RowDetails name={mockApp.name} icon={mockApp.icon} />, { wrapper: Wrapper })

            expect(screen.getByText(mockApp.name)).toBeVisible()
            expect(screen.queryByText(mockApp.desc)).toBeNull()
        })

        it("should handle empty categories array", () => {
            render(<RowDetails name={mockApp.name} icon={mockApp.icon} desc={mockApp.desc} categories={[]} />, {
                wrapper: Wrapper,
            })

            expect(screen.getByText(mockApp.name)).toBeVisible()
            expect(screen.getByText(mockApp.desc)).toBeVisible()
        })
    })

    describe("Favorite Button", () => {
        it("should render favorite button when not favorited", () => {
            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    isFavorite={false}
                    onToggleFavorite={mockOnToggleFavorite}
                />,
                { wrapper: Wrapper },
            )

            const favoriteButton = screen.getByTestId("X2E_APP_WITH_DETAILS_ROW")
            expect(favoriteButton).toBeVisible()
        })

        it("should call onToggleFavorite when favorite button is pressed", () => {
            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    isFavorite={false}
                    onToggleFavorite={mockOnToggleFavorite}
                />,
                { wrapper: Wrapper },
            )

            const row = screen.getByTestId("X2E_APP_WITH_DETAILS_ROW")
            fireEvent.press(row)

            expect(row).toBeVisible()
        })

        it("should not render favorite button when showDetails is true", () => {
            mockUseX2EAppAnimation.mockReturnValue({
                state: {
                    showDetails: true,
                    isAnimating: false,
                    contentVisible: true,
                },
                handlers: {
                    toggleDetails: jest.fn(),
                    onPressIn: jest.fn(),
                    onPressOut: jest.fn(),
                },
                styles: {
                    containerStyle: {},
                    fontStyle: {},
                    imageStyle: {},
                    detailsStyle: {},
                    categoryLabelStyle: {},
                    pressAnimationStyle: {},
                    chevronStyle: {},
                    spacerStyle: {},
                },
                animationProgress: { value: 1 },
            })

            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    isFavorite={false}
                    onToggleFavorite={mockOnToggleFavorite}
                />,
                { wrapper: Wrapper },
            )

            const row = screen.getByTestId("X2E_APP_WITH_DETAILS_ROW")
            expect(row).toBeVisible()
        })
    })

    describe("Expandable Functionality", () => {
        it("should render expandable content when showDetails is true", () => {
            const testString = "Expanded content"
            mockUseX2EAppAnimation.mockReturnValue({
                state: {
                    showDetails: true,
                    isAnimating: false,
                    contentVisible: true,
                },
                handlers: {
                    toggleDetails: jest.fn(),
                    onPressIn: jest.fn(),
                    onPressOut: jest.fn(),
                },
                styles: {
                    containerStyle: {},
                    fontStyle: {},
                    imageStyle: {},
                    detailsStyle: {},
                    categoryLabelStyle: {},
                    pressAnimationStyle: {},
                    chevronStyle: {},
                    spacerStyle: {},
                },
                animationProgress: { value: 1 },
            })

            render(
                <RowDetails name={mockApp.name} icon={mockApp.icon} desc={mockApp.desc} categories={mockApp.categories}>
                    <RowExpandableDetails.Container>
                        <RowExpandableDetails.Description>{testString}</RowExpandableDetails.Description>
                    </RowExpandableDetails.Container>
                </RowDetails>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText("Expanded content")).toBeVisible()
        })

        it("should render categories when expanded", () => {
            mockUseX2EAppAnimation.mockReturnValue({
                state: {
                    showDetails: true,
                    isAnimating: false,
                    contentVisible: true,
                },
                handlers: {
                    toggleDetails: jest.fn(),
                    onPressIn: jest.fn(),
                    onPressOut: jest.fn(),
                },
                styles: {
                    containerStyle: {},
                    fontStyle: {},
                    imageStyle: {},
                    detailsStyle: {},
                    categoryLabelStyle: {},
                    pressAnimationStyle: {},
                    chevronStyle: {},
                    spacerStyle: {},
                },
                animationProgress: { value: 1 },
            })

            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    categories={mockApp.categories}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText("Food & Drink")).toBeVisible()
            expect(screen.getByText("Lifestyle")).toBeVisible()
        })
    })

    describe("Image Handling", () => {
        it("should handle image load errors", () => {
            render(<RowDetails name={mockApp.name} icon="https://invalid-url.com/image.png" desc={mockApp.desc} />, {
                wrapper: Wrapper,
            })

            const image = screen.UNSAFE_getByType(require("react-native").Image)
            fireEvent(image, "error")

            expect(image).toBeVisible()
        })
    })

    describe("External State Management", () => {
        it("should work with external state management", () => {
            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    itemId="test-item-1"
                    isOpen={false}
                    onToggleOpen={mockOnToggleOpen}
                />,
                { wrapper: Wrapper },
            )

            const row = screen.getByTestId("X2E_APP_WITH_DETAILS_ROW")
            expect(row).toBeVisible()
        })

        it("should handle open state from external management", () => {
            mockUseX2EAppAnimation.mockReturnValue({
                state: {
                    showDetails: true,
                    isAnimating: false,
                    contentVisible: true,
                },
                handlers: {
                    toggleDetails: jest.fn(),
                    onPressIn: jest.fn(),
                    onPressOut: jest.fn(),
                },
                styles: {
                    containerStyle: {},
                    fontStyle: {},
                    imageStyle: {},
                    detailsStyle: {},
                    categoryLabelStyle: {},
                    pressAnimationStyle: {},
                    chevronStyle: {},
                    spacerStyle: {},
                },
                animationProgress: { value: 1 },
            })

            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    itemId="test-item-1"
                    isOpen={true}
                    onToggleOpen={mockOnToggleOpen}>
                    <RowExpandableDetails.Container>
                        {/* eslint-disable-next-line i18next/no-literal-string */}
                        <RowExpandableDetails.Description>External state content</RowExpandableDetails.Description>
                    </RowExpandableDetails.Container>
                </RowDetails>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText("External state content")).toBeVisible()
        })
    })

    describe("Accessibility", () => {
        it("should have proper test IDs", () => {
            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    categories={mockApp.categories}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByTestId("X2E_APP_WITH_DETAILS_ROW")).toBeVisible()
            expect(screen.getByTestId("X2E_APP_WITH_DETAILS_NAME")).toBeVisible()
            expect(screen.getByTestId("DAPP_WITH_DETAILS_DESC")).toBeVisible()
        })

        it("should have category test IDs when expanded", () => {
            mockUseX2EAppAnimation.mockReturnValue({
                state: {
                    showDetails: true,
                    isAnimating: false,
                    contentVisible: true,
                },
                handlers: {
                    toggleDetails: jest.fn(),
                    onPressIn: jest.fn(),
                    onPressOut: jest.fn(),
                },
                styles: {
                    containerStyle: {},
                    fontStyle: {},
                    imageStyle: {},
                    detailsStyle: {},
                    categoryLabelStyle: {},
                    pressAnimationStyle: {},
                    chevronStyle: {},
                    spacerStyle: {},
                },
                animationProgress: { value: 1 },
            })

            render(
                <RowDetails
                    name={mockApp.name}
                    icon={mockApp.icon}
                    desc={mockApp.desc}
                    categories={mockApp.categories}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByTestId("DAPP_WITH_DETAILS_CATEGORY_0")).toBeVisible()
            expect(screen.getByTestId("DAPP_WITH_DETAILS_CATEGORY_1")).toBeVisible()
        })
    })
})
