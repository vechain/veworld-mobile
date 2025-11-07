import { fireEvent, render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { RowExpandableDetails } from "./RowExpandableDetails"
import { IconKey } from "~Model"

const TEST_DATA = {
    description: "Test description",
    descriptionText: "Test description text",
    testContent: "Test content",
    appDescription: "App description",
    stats: {
        joined: "4.5",
        users: "1.1M",
        actions: "10.8 T",
        joinedLabel: "Joined",
        usersLabel: "Users",
        actionsLabel: "Actions",
        customJoined: "2.3",
        customUsers: "500K",
        customActions: "5.2 T",
        customJoinedLabel: "Members",
        customUsersLabel: "Active Users",
        customActionsLabel: "Total Actions",
        partialJoined: "1.0",
        partialActions: "2.0 T",
    },
    buttons: {
        favorite: "Favorite",
        favorited: "Favorited",
        open: "Open",
    },
} as const

const Wrapper = ({ children }: PropsWithChildren) => (
    <TestWrapper
        preloadedState={{
            discovery: {
                featured: [],
                favoriteRefs: [],
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

describe("X2EAppDetails", () => {
    describe("Container", () => {
        it("should render children correctly", () => {
            render(
                <RowExpandableDetails.Container>
                    <RowExpandableDetails.Description>{TEST_DATA.description}</RowExpandableDetails.Description>
                </RowExpandableDetails.Container>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.description)).toBeVisible()
        })
    })

    describe("Description", () => {
        it("should render description text correctly", () => {
            render(<RowExpandableDetails.Description>{TEST_DATA.descriptionText}</RowExpandableDetails.Description>, {
                wrapper: Wrapper,
            })

            expect(screen.getByText(TEST_DATA.descriptionText)).toBeVisible()
        })

        it("should have correct typography and styling", () => {
            render(<RowExpandableDetails.Description>{TEST_DATA.description}</RowExpandableDetails.Description>, {
                wrapper: Wrapper,
            })

            const descriptionText = screen.getByText(TEST_DATA.description)
            expect(descriptionText).toBeVisible()
        })
    })

    describe("Stats", () => {
        it("should render stats with app overview data", () => {
            const mockAppOverview = {
                totalUniqueUserInteractions: 1100000,
                actionsRewarded: 10800000000000,
            }

            render(
                <RowExpandableDetails.Stats appOverview={mockAppOverview as any} createdAtTimestamp="1640995200" />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.stats.joinedLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.usersLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.actionsLabel)).toBeVisible()
            expect(screen.getByText("1.1M")).toBeVisible() // formatted users
            expect(screen.getByText("10.8T")).toBeVisible() // formatted actions
        })

        it("should render loading state for stats", () => {
            render(<RowExpandableDetails.Stats isLoading={true} createdAtTimestamp="1640995200" />, {
                wrapper: Wrapper,
            })

            expect(screen.getByText(TEST_DATA.stats.joinedLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.usersLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.actionsLabel)).toBeVisible()
            // Should show skeleton loading for users and actions, but actual date for joined
        })

        it("should render custom stats correctly", () => {
            const customStats = {
                joined: {
                    value: TEST_DATA.stats.customJoined,
                    label: TEST_DATA.stats.customJoinedLabel,
                    icon: "icon-certified" as IconKey,
                },
                users: {
                    value: TEST_DATA.stats.customUsers,
                    label: TEST_DATA.stats.customUsersLabel,
                    icon: "icon-users" as IconKey,
                },
                actions: {
                    value: TEST_DATA.stats.customActions,
                    label: TEST_DATA.stats.customActionsLabel,
                    icon: "icon-leaf" as IconKey,
                },
            }

            render(<RowExpandableDetails.Stats {...customStats} />, { wrapper: Wrapper })

            expect(screen.getByText(TEST_DATA.stats.customJoined)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.customUsers)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.customActions)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.customJoinedLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.customUsersLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.customActionsLabel)).toBeVisible()
        })

        it("should render partial stats when some props are undefined", () => {
            render(
                <RowExpandableDetails.Stats
                    joined={{
                        value: TEST_DATA.stats.partialJoined,
                        label: TEST_DATA.stats.joinedLabel,
                        icon: "icon-certified" as IconKey,
                    }}
                    users={undefined}
                    actions={{
                        value: TEST_DATA.stats.partialActions,
                        label: TEST_DATA.stats.actionsLabel,
                        icon: "icon-leaf" as IconKey,
                    }}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.stats.partialJoined)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.partialActions)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.joinedLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.actionsLabel)).toBeVisible()
            expect(screen.getByText(TEST_DATA.stats.usersLabel)).toBeVisible()
        })
    })

    describe("Actions", () => {
        const mockOnAddToFavorites = jest.fn()
        const mockOnOpen = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it("should render favorite and open buttons", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={mockOnOpen}
                    isFavorite={false}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.buttons.favorite)).toBeVisible()
            expect(screen.getByText(TEST_DATA.buttons.open)).toBeVisible()
        })

        it("should call onAddToFavorites when favorite button is pressed", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={mockOnOpen}
                    isFavorite={false}
                />,
                { wrapper: Wrapper },
            )

            const favoriteButton = screen.getByText(TEST_DATA.buttons.favorite)
            fireEvent.press(favoriteButton)

            expect(mockOnAddToFavorites).toHaveBeenCalledTimes(1)
        })

        it("should call onOpen when open button is pressed", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={mockOnOpen}
                    isFavorite={false}
                />,
                { wrapper: Wrapper },
            )

            const openButton = screen.getByText(TEST_DATA.buttons.open)
            fireEvent.press(openButton)

            expect(mockOnOpen).toHaveBeenCalledTimes(1)
        })

        it("should show favorited state when isFavorite is true", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={mockOnOpen}
                    isFavorite={true}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.buttons.favorited)).toBeVisible()
        })

        it("should use default handlers when not provided", () => {
            render(<RowExpandableDetails.Actions />, { wrapper: Wrapper })

            const favoriteButton = screen.getByText(TEST_DATA.buttons.favorite)
            const openButton = screen.getByText(TEST_DATA.buttons.open)

            fireEvent.press(favoriteButton)
            fireEvent.press(openButton)

            expect(favoriteButton).toBeVisible()
            expect(openButton).toBeVisible()
        })
    })

    describe("Actions - Favorite Button Integration", () => {
        const mockOnAddToFavorites = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it("should render favorite button with correct text when not favorited", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={jest.fn()}
                    isFavorite={false}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.buttons.favorite)).toBeVisible()
        })

        it("should render favorited button with correct text when favorited", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={jest.fn()}
                    isFavorite={true}
                />,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.buttons.favorited)).toBeVisible()
        })

        it("should call onAddToFavorites when favorite button is pressed", () => {
            render(
                <RowExpandableDetails.Actions
                    onAddToFavorites={mockOnAddToFavorites}
                    onOpen={jest.fn()}
                    isFavorite={false}
                />,
                { wrapper: Wrapper },
            )

            const favoriteButton = screen.getByText(TEST_DATA.buttons.favorite)
            fireEvent.press(favoriteButton)

            expect(mockOnAddToFavorites).toHaveBeenCalledTimes(1)
        })
    })

    describe("Main Component", () => {
        it("should render children when show is true", () => {
            render(
                <RowExpandableDetails show={true}>
                    <RowExpandableDetails.Description>{TEST_DATA.testContent}</RowExpandableDetails.Description>
                </RowExpandableDetails>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.testContent)).toBeVisible()
        })

        it("should render children when show is true and visible is true", () => {
            render(
                <RowExpandableDetails show={true} visible={true}>
                    <RowExpandableDetails.Description>{TEST_DATA.testContent}</RowExpandableDetails.Description>
                </RowExpandableDetails>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.testContent)).toBeVisible()
        })

        it("should handle show and visible props correctly", () => {
            const { rerender } = render(
                <RowExpandableDetails show={true} visible={true}>
                    <RowExpandableDetails.Description>{TEST_DATA.testContent}</RowExpandableDetails.Description>
                </RowExpandableDetails>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.testContent)).toBeVisible()

            rerender(
                <RowExpandableDetails show={false} visible={true}>
                    <RowExpandableDetails.Description>{TEST_DATA.testContent}</RowExpandableDetails.Description>
                </RowExpandableDetails>,
            )

            expect(screen.getByText(TEST_DATA.testContent)).toBeVisible()
        })

        it("should render complex content structure", () => {
            const mockAppOverview = {
                totalUniqueUserInteractions: 1100000,
                actionsRewarded: 10800000000000,
            }

            render(
                <RowExpandableDetails show={true}>
                    <RowExpandableDetails.Container>
                        <RowExpandableDetails.Description>{TEST_DATA.appDescription}</RowExpandableDetails.Description>
                        <RowExpandableDetails.Stats
                            appOverview={mockAppOverview as any}
                            createdAtTimestamp="1640995200"
                        />
                        <RowExpandableDetails.Actions />
                    </RowExpandableDetails.Container>
                </RowExpandableDetails>,
                { wrapper: Wrapper },
            )

            expect(screen.getByText(TEST_DATA.appDescription)).toBeVisible()
            expect(screen.getByText("1.1M")).toBeVisible() // formatted users from mock data
            expect(screen.getByText(TEST_DATA.buttons.favorite)).toBeVisible()
            expect(screen.getByText(TEST_DATA.buttons.open)).toBeVisible()
        })
    })
})
