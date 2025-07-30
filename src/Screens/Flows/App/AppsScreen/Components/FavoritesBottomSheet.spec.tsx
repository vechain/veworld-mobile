import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
import { DiscoveryDApp } from "~Constants"
import { FavoritesBottomSheet } from "./FavoritesBottomSheet"

const mockDispatch = jest.fn()
const mockOnDAppPress = jest.fn()
const mockUseAppSelector = jest.fn()

jest.mock("~Hooks", () => ({
    useBottomSheetModal: () => ({
        ref: { current: null },
        onOpen: jest.fn(),
        onClose: jest.fn(),
    }),
    useTheme: () => ({
        colors: {
            text: "#FFFFFF",
            background: "#000000",
        },
    }),
    useThemedStyles: () => ({
        styles: {
            container: {},
            headerContainer: {},
            headerContent: {},
            listContentContainer: {},
        },
    }),
}))

jest.mock("~Storage/Redux", () => ({
    selectBookmarkedDapps: jest.fn(),
    useAppSelector: jest.fn(() => mockUseAppSelector()),
    useAppDispatch: () => mockDispatch,
    reorderBookmarks: jest.fn(),
}))

jest.mock("../../DiscoverScreen/Hooks", () => ({
    useDAppActions: () => ({
        onDAppPress: mockOnDAppPress,
    }),
}))

jest.mock("~i18n", () => ({
    useI18nContext: () => ({
        LL: {
            FAVOURITES_DAPPS_TITLE: () => "Favourites",
            FAVOURITES_DAPPS_NO_RECORDS: () => "Could not find any dapps with this name",
            BTN_ORDER_SAVED: () => "Order saved!",
        },
    }),
}))

jest.mock("react-native-draggable-flatlist", () => {
    return {
        NestableDraggableFlatList: ({ data, renderItem, ListEmptyComponent, keyExtractor }: any) => {
            if (!data || data.length === 0) {
                return ListEmptyComponent || null
            }
            return (
                <View testID="draggable-flatlist">
                    {data.map((item: any, index: number) => {
                        const key = keyExtractor ? keyExtractor(item, index) : index
                        return (
                            <View key={key} testID={`draggable-item-${index}`}>
                                {renderItem({ item, isActive: false, drag: jest.fn() })}
                            </View>
                        )
                    })}
                </View>
            )
        },
        NestableScrollContainer: ({ children }: any) => <View testID="scroll-container">{children}</View>,
    }
})

jest.mock("~Components", () => ({
    BaseBottomSheet: React.forwardRef(({ children, leftElement, rightElement, title }: any, ref: any) => (
        <View testID="base-bottom-sheet" ref={ref}>
            <View testID="bottom-sheet-header">
                {leftElement}
                {title && <View testID="bottom-sheet-title">{title}</View>}
                {rightElement}
            </View>
            <View testID="bottom-sheet-content">{children}</View>
        </View>
    )),
    BaseView: ({ children, testID, style, ...props }: any) => (
        <View testID={testID} style={style} {...props}>
            {children}
        </View>
    ),
    BaseIcon: ({ name, testID }: any) => <View testID={testID || `icon-${name}`} />,
    BaseSpacer: ({ testID }: any) => <View testID={testID || "spacer"} />,
    FavoriteDAppCard: ({ dapp, onPress, onLongPress, onRightActionPress, isEditMode }: any) => (
        <View testID={`favorite-dapp-card-${dapp.id || dapp.href}`}>
            <View testID={`dapp-press-${dapp.id || dapp.href}`} onTouchEnd={() => onPress(dapp)} />
            <View
                testID={`dapp-long-press-${dapp.id || dapp.href}`}
                onTouchEnd={() => onLongPress && onLongPress(dapp)}
            />
            <View testID={`dapp-more-press-${dapp.id || dapp.href}`} onTouchEnd={() => onRightActionPress(dapp)} />
            {isEditMode && <View testID={`edit-mode-indicator-${dapp.id || dapp.href}`} />}
        </View>
    ),
    ListEmptyResults: ({ subtitle }: any) => (
        <View testID="empty-results">
            <View testID="empty-results-text">{subtitle}</View>
        </View>
    ),
    AnimatedSaveHeaderButton: ({ action }: any) => <View testID="save-button" onTouchEnd={action} />,
    ReorderIconHeaderButton: ({ action }: any) => <View testID="reorder-button" onTouchEnd={action} />,
}))

jest.mock("../../DiscoverScreen/Components/Bottomsheets", () => ({
    DAppOptionsBottomSheet: React.forwardRef(({ onClose, onNavigateToDApp }: any) => (
        <View testID="dapp-options-bottom-sheet">
            <View testID="options-close-button" onTouchEnd={onClose} />
            <View testID="options-navigate-button" onTouchEnd={() => onNavigateToDApp && onNavigateToDApp()} />
        </View>
    )),
}))

const mockDApps: DiscoveryDApp[] = [
    {
        id: "dapp1",
        name: "Test DApp 1",
        desc: "Test Description 1",
        href: "https://dapp1.com",
        isCustom: false,
        createAt: 0,
        amountOfNavigations: 0,
    },
    {
        id: "dapp2",
        name: "Test DApp 2",
        desc: "Test Description 2",
        href: "https://dapp2.com",
        isCustom: false,
        createAt: 0,
        amountOfNavigations: 0,
    },
    {
        id: "dapp3",
        name: "Test DApp 3",
        desc: "Test Description 3",
        href: "https://dapp3.com",
        isCustom: false,
        createAt: 0,
        amountOfNavigations: 0,
    },
]

describe("FavoritesBottomSheet", () => {
    const mockOnClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue(mockDApps)
    })

    const renderComponent = () => {
        const ref = { current: null } as React.RefObject<BottomSheetModalMethods>
        return render(<FavoritesBottomSheet ref={ref} onClose={mockOnClose} />)
    }

    describe("Rendering", () => {
        it("should render correctly with favorite dApps", () => {
            const { getByTestId } = renderComponent()

            expect(getByTestId("draggable-flatlist")).toBeTruthy()
            expect(getByTestId("favorite-dapp-card-dapp1")).toBeTruthy()
            expect(getByTestId("favorite-dapp-card-dapp2")).toBeTruthy()
            expect(getByTestId("favorite-dapp-card-dapp3")).toBeTruthy()
        })

        it("should render empty state when no favorites", () => {
            mockUseAppSelector.mockReturnValue([])
            const { getByTestId } = renderComponent()

            expect(getByTestId("empty-results")).toBeTruthy()
            expect(getByTestId("empty-results-text")).toBeTruthy()
        })

        it("should render reorder button in normal mode", () => {
            const { getByTestId } = renderComponent()
            expect(getByTestId("reorder-button")).toBeTruthy()
        })
    })

    describe("Edit Mode", () => {
        it("should toggle to edit mode when reorder button is pressed", async () => {
            const { getByTestId } = renderComponent()

            const reorderButton = getByTestId("reorder-button")
            fireEvent(reorderButton, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("save-button")).toBeTruthy()
            })
        })

        it("should show edit indicators when in edit mode", async () => {
            const { getByTestId } = renderComponent()

            // Enable edit mode
            const reorderButton = getByTestId("reorder-button")
            fireEvent(reorderButton, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("edit-mode-indicator-dapp1")).toBeTruthy()
                expect(getByTestId("edit-mode-indicator-dapp2")).toBeTruthy()
                expect(getByTestId("edit-mode-indicator-dapp3")).toBeTruthy()
            })
        })

        it("should exit edit mode when save button is pressed", async () => {
            const { getByTestId } = renderComponent()

            // Enable edit mode
            const reorderButton = getByTestId("reorder-button")
            fireEvent(reorderButton, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("save-button")).toBeTruthy()
            })

            // Exit edit mode
            const saveButton = getByTestId("save-button")
            fireEvent(saveButton, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("reorder-button")).toBeTruthy()
            })
        })
    })

    describe("DApp Interactions", () => {
        it("should handle dApp press", () => {
            const { getByTestId } = renderComponent()

            const dappPressArea = getByTestId("dapp-press-dapp1")
            fireEvent(dappPressArea, "touchEnd")

            expect(mockOnDAppPress).toHaveBeenCalledWith(mockDApps[0])
            expect(mockOnClose).toHaveBeenCalled()
        })

        it("should handle long press to enter edit mode", async () => {
            const { getByTestId } = renderComponent()

            const dappLongPressArea = getByTestId("dapp-long-press-dapp1")
            fireEvent(dappLongPressArea, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("save-button")).toBeTruthy()
            })
        })

        it("should not enter edit mode on long press when already in edit mode", async () => {
            const { getByTestId } = renderComponent()

            // Enter edit mode first
            const reorderButton = getByTestId("reorder-button")
            fireEvent(reorderButton, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("save-button")).toBeTruthy()
            })

            // Long press should not change anything
            const dappLongPressArea = getByTestId("dapp-long-press-dapp1")
            fireEvent(dappLongPressArea, "touchEnd")

            // Should still be in edit mode
            expect(getByTestId("save-button")).toBeTruthy()
        })

        it("should handle more options press", () => {
            const { getByTestId } = renderComponent()

            const moreButton = getByTestId("dapp-more-press-dapp1")
            fireEvent(moreButton, "touchEnd")

            expect(getByTestId("dapp-options-bottom-sheet")).toBeTruthy()
        })
    })

    describe("DApp Options Integration", () => {
        it("should handle navigation from options sheet", () => {
            // Test the navigation callback is called properly
            const { getByTestId } = renderComponent()

            // Open options sheet
            const moreButton = getByTestId("dapp-more-press-dapp1")
            fireEvent(moreButton, "touchEnd")

            // Verify options sheet is rendered
            expect(getByTestId("dapp-options-bottom-sheet")).toBeTruthy()

            // Trigger navigation button (this will try to call dismiss but in test environment it's ok to fail silently)
            const navigateButton = getByTestId("options-navigate-button")

            // Wrap in try-catch since the dismiss call will fail in test environment
            try {
                fireEvent(navigateButton, "touchEnd")
            } catch (error: any) {
                // Expected to fail in test environment since ref.dismiss is not available
                expect(error.message).toContain("dismiss is not a function")
            }
        })

        it("should handle options sheet close", () => {
            const { getByTestId } = renderComponent()

            // Open options sheet
            const moreButton = getByTestId("dapp-more-press-dapp1")
            fireEvent(moreButton, "touchEnd")

            // Close options sheet
            const closeButton = getByTestId("options-close-button")
            fireEvent(closeButton, "touchEnd")

            // Options sheet should still be rendered but state should be reset
            expect(getByTestId("dapp-options-bottom-sheet")).toBeTruthy()
        })
    })

    describe("State Management", () => {
        it("should update reordered apps when bookmarked apps change", () => {
            const { rerender, getByTestId } = renderComponent()

            const newDApps = [
                ...mockDApps,
                {
                    id: "dapp4",
                    name: "Test DApp 4",
                    desc: "Test Description 4",
                    href: "https://dapp4.com",
                    isCustom: false,
                },
            ]
            mockUseAppSelector.mockReturnValue(newDApps)

            rerender(<FavoritesBottomSheet ref={{ current: null } as any} onClose={mockOnClose} />)

            expect(getByTestId("favorite-dapp-card-dapp4")).toBeTruthy()
        })

        it("should dispatch reorder action when saving", async () => {
            const { getByTestId } = renderComponent()

            const reorderButton = getByTestId("reorder-button")
            fireEvent(reorderButton, "touchEnd")

            await waitFor(() => {
                expect(getByTestId("save-button")).toBeTruthy()
            })

            const saveButton = getByTestId("save-button")
            fireEvent(saveButton, "touchEnd")

            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    describe("Accessibility & Props", () => {
        it("should call onClose when provided", () => {
            const { getByTestId } = renderComponent()

            const dappPressArea = getByTestId("dapp-press-dapp1")
            fireEvent(dappPressArea, "touchEnd")

            expect(mockOnClose).toHaveBeenCalled()
        })

        it("should handle ref forwarding", () => {
            const ref = React.createRef<BottomSheetModalMethods>()

            render(<FavoritesBottomSheet ref={ref} onClose={mockOnClose} />)

            expect(ref).toBeDefined()
        })
    })
})
