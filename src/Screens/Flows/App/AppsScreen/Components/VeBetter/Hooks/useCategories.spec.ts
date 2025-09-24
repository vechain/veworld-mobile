import { renderHook } from "@testing-library/react-hooks"
import { X2ECategoryType } from "~Model/DApp"
import { IconKey } from "~Model/Icon"
import { useCategories } from "./useCategories"

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

describe("useCategories", () => {
    it("should return all X2E categories with correct structure", () => {
        const { result } = renderHook(() => useCategories())

        expect(result.current).toHaveLength(10)

        result.current.forEach(category => {
            expect(category).toHaveProperty("id")
            expect(category).toHaveProperty("displayName")
            expect(category).toHaveProperty("icon")
            expect(typeof category.id).toBe("string")
            expect(typeof category.displayName).toBe("string")
            expect(typeof category.icon).toBe("string")
        })
    })

    it("should return categories with correct IDs", () => {
        const { result } = renderHook(() => useCategories())

        const expectedIds = [
            X2ECategoryType.NUTRITION,
            X2ECategoryType.PLASTIC_WASTE_RECYCLING,
            X2ECategoryType.FITNESS_WELLNESS,
            X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY,
            X2ECategoryType.SUSTAINABLE_SHOPPING,
            X2ECategoryType.GREEN_MOBILITY_TRAVEL,
            X2ECategoryType.PETS,
            X2ECategoryType.EDUCATION_LEARNING,
            X2ECategoryType.GREEN_FINANCE_DEFI,
            X2ECategoryType.OTHERS,
        ]

        const actualIds = result.current.map(category => category.id)
        expect(actualIds).toEqual(expectedIds)
    })

    it("should return categories with correct display names", () => {
        const { result } = renderHook(() => useCategories())

        const expectedDisplayNames = [
            "Food & Drink",
            "Recycling",
            "Lifestyle",
            "Energy",
            "Shopping",
            "Transportation",
            "Pets",
            "Learning",
            "Web3",
            "Others",
        ]

        const actualDisplayNames = result.current.map(category => category.displayName)
        expect(actualDisplayNames).toEqual(expectedDisplayNames)
    })

    it("should return categories with correct icons", () => {
        const { result } = renderHook(() => useCategories())

        const expectedIcons: IconKey[] = [
            "icon-salad",
            "icon-recycle",
            "icon-dumbbell",
            "icon-plug",
            "icon-shopping-bag",
            "icon-car",
            "icon-cat",
            "icon-graduation-cap",
            "icon-codesandbox",
            "icon-more-horizontal",
        ]

        const actualIcons = result.current.map(category => category.icon)
        expect(actualIcons).toEqual(expectedIcons)
    })

    it("should have unique IDs for all categories", () => {
        const { result } = renderHook(() => useCategories())

        const ids = result.current.map(category => category.id)
        const uniqueIds = new Set(ids)

        expect(uniqueIds.size).toBe(ids.length)
    })

    it("should have unique display names for all categories", () => {
        const { result } = renderHook(() => useCategories())

        const displayNames = result.current.map(category => category.displayName)
        const uniqueDisplayNames = new Set(displayNames)

        expect(uniqueDisplayNames.size).toBe(displayNames.length)
    })

    it("should have unique icons for all categories", () => {
        const { result } = renderHook(() => useCategories())

        const icons = result.current.map(category => category.icon)
        const uniqueIcons = new Set(icons)

        expect(uniqueIcons.size).toBe(icons.length)
    })

    it("should return categories in the correct order", () => {
        const { result } = renderHook(() => useCategories())

        const expectedOrder = [
            { id: X2ECategoryType.NUTRITION, displayName: "Food & Drink", icon: "icon-salad" },
            { id: X2ECategoryType.PLASTIC_WASTE_RECYCLING, displayName: "Recycling", icon: "icon-recycle" },
            { id: X2ECategoryType.FITNESS_WELLNESS, displayName: "Lifestyle", icon: "icon-dumbbell" },
            { id: X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY, displayName: "Energy", icon: "icon-plug" },
            { id: X2ECategoryType.SUSTAINABLE_SHOPPING, displayName: "Shopping", icon: "icon-shopping-bag" },
            { id: X2ECategoryType.GREEN_MOBILITY_TRAVEL, displayName: "Transportation", icon: "icon-car" },
            { id: X2ECategoryType.PETS, displayName: "Pets", icon: "icon-cat" },
            { id: X2ECategoryType.EDUCATION_LEARNING, displayName: "Learning", icon: "icon-graduation-cap" },
            { id: X2ECategoryType.GREEN_FINANCE_DEFI, displayName: "Web3", icon: "icon-codesandbox" },
            { id: X2ECategoryType.OTHERS, displayName: "Others", icon: "icon-more-horizontal" },
        ]

        expect(result.current).toEqual(expectedOrder)
    })
})
