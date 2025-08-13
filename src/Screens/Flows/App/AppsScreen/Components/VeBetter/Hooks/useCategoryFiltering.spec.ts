import { act, renderHook } from "@testing-library/react-hooks"
import { X2ECategoryType } from "~Model/DApp"
import { IconKey } from "~Model/Icon"
import { TestHelpers } from "~Test"
import { useCategoryFiltering } from "./useCategoryFiltering"

const mockLL = {
    APP_CATEGORY_FOOD_AND_DRINK: () => "Food & Drink",
    APP_CATEGORY_RECYCLING: () => "Recycling",
    APP_CATEGORY_LIFESTYLE: () => "Lifestyle",
    APP_CATEGORY_ENERGY: () => "Energy",
    APP_CATEGORY_SHOPPING: () => "Shopping",
    APP_CATEGORY_TRANSPORTATION: () => "Transportation",
    APP_CATEGORY_PETS: () => "Pets",
    APP_CATEGORY_LEARNING: () => "Learning",
    APP_CATEGORY_WEB3: () => "Web3",
    APP_CATEGORY_OTHERS: () => "Others",
}

jest.mock("~i18n", () => ({
    useI18nContext: () => ({
        LL: mockLL,
    }),
}))

jest.mock("./useCategories", () => ({
    useCategories: () => [
        {
            id: X2ECategoryType.NUTRITION,
            displayName: "Food & Drink",
            icon: "icon-salad" as IconKey,
        },
        {
            id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
            displayName: "Recycling",
            icon: "icon-recycle" as IconKey,
        },
        {
            id: X2ECategoryType.FITNESS_WELLNESS,
            displayName: "Lifestyle",
            icon: "icon-dumbbell" as IconKey,
        },
    ],
}))

describe("useCategoryFiltering", () => {
    const mockApps = [
        TestHelpers.data.mockApp1,
        TestHelpers.data.mockApp2,
        TestHelpers.data.mockApp3,
        TestHelpers.data.mockApp4,
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should initialize with default selected category (NUTRITION)", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.NUTRITION)
        expect(result.current.selectedCategory.displayName).toBe("Food & Drink")
        expect(result.current.selectedCategory.icon).toBe("icon-salad")
    })

    it("should return all apps when no filtering is applied", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        expect(result.current.filteredApps).toHaveLength(2)
        expect(result.current.filteredApps[0].name).toBe("A App")
        expect(result.current.filteredApps[1].name).toBe("C App")
    })

    it("should filter apps by selected category", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        act(() => {
            result.current.setSelectedCategory({
                id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
                displayName: "Recycling",
                icon: "icon-recycle" as IconKey,
            })
        })

        expect(result.current.filteredApps).toHaveLength(1)
        expect(result.current.filteredApps[0].name).toBe("B App")
        expect(result.current.filteredApps[0].categories).toContain(X2ECategoryType.PLASTIC_WASTE_RECYCLING)
    })

    it("should sort filtered apps alphabetically", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        expect(result.current.filteredApps[0].name).toBe("A App")
        expect(result.current.filteredApps[1].name).toBe("C App")
    })

    it("should handle apps with multiple categories", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        act(() => {
            result.current.setSelectedCategory({
                id: X2ECategoryType.FITNESS_WELLNESS,
                displayName: "Lifestyle",
                icon: "icon-dumbbell" as IconKey,
            })
        })

        expect(result.current.filteredApps).toHaveLength(1)
        expect(result.current.filteredApps[0].name).toBe("C App")
        expect(result.current.filteredApps[0].categories).toContain(X2ECategoryType.FITNESS_WELLNESS)
    })

    it("should handle apps without categories", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        const appWithoutCategories = mockApps.find(app => app.name === "D App")
        expect(appWithoutCategories).toBeDefined()
        expect(appWithoutCategories?.categories).toBeUndefined()

        const filteredAppNames = result.current.filteredApps.map(app => app.name)
        expect(filteredAppNames).not.toContain("D App")
    })

    it("should handle undefined apps data", () => {
        const { result } = renderHook(() => useCategoryFiltering(undefined))

        expect(result.current.filteredApps).toEqual([])
    })

    it("should handle empty apps data", () => {
        const { result } = renderHook(() => useCategoryFiltering([]))

        expect(result.current.filteredApps).toEqual([])
    })

    it("should update selected category when setSelectedCategory is called", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.NUTRITION)

        act(() => {
            result.current.setSelectedCategory({
                id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
                displayName: "Recycling",
                icon: "icon-recycle" as IconKey,
            })
        })

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.PLASTIC_WASTE_RECYCLING)
        expect(result.current.selectedCategory.displayName).toBe("Recycling")
        expect(result.current.selectedCategory.icon).toBe("icon-recycle")
    })

    it("should return the same filtered apps when category doesn't change", () => {
        const { result, rerender } = renderHook(() => useCategoryFiltering(mockApps))

        const firstFilteredApps = result.current.filteredApps

        rerender()

        const secondFilteredApps = result.current.filteredApps

        expect(secondFilteredApps).toBe(firstFilteredApps)
    })

    it("should return different filtered apps when category changes", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps))

        const nutritionApps = result.current.filteredApps

        act(() => {
            result.current.setSelectedCategory({
                id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
                displayName: "Recycling",
                icon: "icon-recycle" as IconKey,
            })
        })

        const recyclingApps = result.current.filteredApps

        expect(recyclingApps).not.toEqual(nutritionApps)
        expect(recyclingApps).toHaveLength(1)
        expect(nutritionApps).toHaveLength(2)
    })

    it("should initialize with provided initialCategoryId", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps, X2ECategoryType.PLASTIC_WASTE_RECYCLING))

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.PLASTIC_WASTE_RECYCLING)
        expect(result.current.selectedCategory.displayName).toBe("Recycling")
        expect(result.current.selectedCategory.icon).toBe("icon-recycle")
    })

    it("should filter apps correctly when initialized with initialCategoryId", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps, X2ECategoryType.PLASTIC_WASTE_RECYCLING))

        expect(result.current.filteredApps).toHaveLength(1)
        expect(result.current.filteredApps[0].name).toBe("B App")
        expect(result.current.filteredApps[0].categories).toContain(X2ECategoryType.PLASTIC_WASTE_RECYCLING)
    })

    it("should fallback to default category when initialCategoryId is undefined", () => {
        const { result } = renderHook(() => useCategoryFiltering(mockApps, undefined))

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.NUTRITION)
        expect(result.current.selectedCategory.displayName).toBe("Food & Drink")
        expect(result.current.selectedCategory.icon).toBe("icon-salad")
    })

    it("should update selected category when initialCategoryId changes", () => {
        const { result, rerender } = renderHook(
            ({ initialCategoryId }) => useCategoryFiltering(mockApps, initialCategoryId),
            { initialProps: { initialCategoryId: X2ECategoryType.NUTRITION } },
        )

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.NUTRITION)

        rerender({ initialCategoryId: X2ECategoryType.PLASTIC_WASTE_RECYCLING })

        expect(result.current.selectedCategory.id).toBe(X2ECategoryType.PLASTIC_WASTE_RECYCLING)
        expect(result.current.selectedCategory.displayName).toBe("Recycling")
        expect(result.current.filteredApps).toHaveLength(1)
        expect(result.current.filteredApps[0].name).toBe("B App")
    })
})
