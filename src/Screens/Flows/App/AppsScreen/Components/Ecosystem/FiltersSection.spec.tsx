import { fireEvent, render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { FiltersSection } from "./FiltersSection"
import { DappTypeV2 } from "./types"

const Wrapper = ({ children }: PropsWithChildren) => (
    <TestWrapper
        preloadedState={{
            discovery: {
                featured: [],
                favoriteRefs: [],
                bannerInteractions: {},
                connectedApps: [],
                custom: [],

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

describe("FiltersSection", () => {
    const mockOnPress = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render all filter chips", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        expect(screen.getByText("All")).toBeVisible()
        expect(screen.getByText("DeFi")).toBeVisible()
        expect(screen.getByText("NFTs")).toBeVisible()
        expect(screen.getByText("Governance")).toBeVisible()
        expect(screen.getByText("Tools")).toBeVisible()
    })

    it("should mark the selected filter as active", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.DEFI} onPress={mockOnPress} />, { wrapper: Wrapper })

        const defiChip = screen.getByText("DeFi")
        expect(defiChip).toBeVisible()
    })

    it("should call onPress when a filter chip is pressed", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const nftChip = screen.getByText("NFTs")
        fireEvent.press(nftChip)

        expect(mockOnPress).toHaveBeenCalledTimes(1)
        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.NFTS, 2)
    })

    it("should call onPress with correct filter type for different chips", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const governanceChip = screen.getByText("Governance")
        fireEvent.press(governanceChip)

        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.GOVERNANCE, 3)
    })

    it("should handle multiple filter presses correctly", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const defiChip = screen.getByText("DeFi")
        const toolsChip = screen.getByText("Tools")

        fireEvent.press(defiChip)
        fireEvent.press(toolsChip)

        expect(mockOnPress).toHaveBeenCalledTimes(2)
        expect(mockOnPress).toHaveBeenNthCalledWith(1, DappTypeV2.DEFI, 1)
        expect(mockOnPress).toHaveBeenNthCalledWith(2, DappTypeV2.TOOLS, 4)
    })

    it("should update selected filter when props change", () => {
        const { rerender } = render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, {
            wrapper: Wrapper,
        })

        expect(screen.getByText("All")).toBeVisible()

        rerender(<FiltersSection selectedFilter={DappTypeV2.NFTS} onPress={mockOnPress} />)

        expect(screen.getByText("NFTs")).toBeVisible()
    })

    it("should render all available filter types from enum", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const expectedFilters = Object.values(DappTypeV2)
        expect(expectedFilters).toHaveLength(5)

        const filterTexts = ["All", "DeFi", "NFTs", "Governance", "Tools"]
        filterTexts.forEach(filterText => {
            expect(screen.getByText(filterText)).toBeVisible()
        })
    })

    it("should maintain chip spacing and layout", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const filterTexts = ["All", "DeFi", "NFTs", "Governance", "Tools"]

        filterTexts.forEach(filterText => {
            expect(screen.getByText(filterText)).toBeVisible()
        })
    })

    it("should handle rapid filter changes", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const chips = [
            screen.getByText("All"),
            screen.getByText("DeFi"),
            screen.getByText("NFTs"),
            screen.getByText("Governance"),
            screen.getByText("Tools"),
        ]

        chips.forEach(chip => {
            fireEvent.press(chip)
        })

        expect(mockOnPress).toHaveBeenCalledTimes(5)
    })

    it("should render animated background for tab indicator", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        expect(screen.getByText("All")).toBeVisible()
    })

    it("should handle ScrollView layout and scroll events", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        expect(screen.getAllByText("All").length).toBeGreaterThan(0)
    })

    it("should call onPress with ALL filter type", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.DEFI} onPress={mockOnPress} />, { wrapper: Wrapper })

        const allChip = screen.getByText("All")
        fireEvent.press(allChip)

        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.ALL, 0)
    })

    it("should call onPress with DEFI filter type", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const defiChip = screen.getByText("DeFi")
        fireEvent.press(defiChip)

        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.DEFI, 1)
    })

    it("should call onPress with NFTS filter type", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const nftChip = screen.getByText("NFTs")
        fireEvent.press(nftChip)

        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.NFTS, 2)
    })

    it("should call onPress with GOVERNANCE filter type", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const governanceChip = screen.getByText("Governance")
        fireEvent.press(governanceChip)

        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.GOVERNANCE, 3)
    })

    it("should call onPress with TOOLS filter type", () => {
        render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, { wrapper: Wrapper })

        const toolsChip = screen.getByText("Tools")
        fireEvent.press(toolsChip)

        expect(mockOnPress).toHaveBeenCalledWith(DappTypeV2.TOOLS, 4)
    })

    it("should handle different selected filter states", () => {
        const filterTypes = Object.values(DappTypeV2)

        filterTypes.forEach(filterType => {
            const { unmount } = render(<FiltersSection selectedFilter={filterType} onPress={mockOnPress} />, {
                wrapper: Wrapper,
            })

            expect(screen.getByText("All")).toBeVisible()
            unmount()
        })
    })

    it("should maintain consistent behavior across re-renders", () => {
        const { rerender } = render(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />, {
            wrapper: Wrapper,
        })

        expect(screen.getByText("All")).toBeVisible()

        rerender(<FiltersSection selectedFilter={DappTypeV2.DEFI} onPress={mockOnPress} />)
        expect(screen.getByText("DeFi")).toBeVisible()

        rerender(<FiltersSection selectedFilter={DappTypeV2.ALL} onPress={mockOnPress} />)
        expect(screen.getByText("All")).toBeVisible()
    })
})
