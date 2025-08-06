import { useState, useMemo } from "react"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { useX2ECategories } from "./X2ECategories"
import { X2ECategoryType } from "~Model/DApp"
import { IconKey } from "~Model/Icon"
import { useVeBetterDaoDapps } from "~Hooks"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

interface UseX2ECategoryFilteringReturn {
    selectedCategory: {
        id: X2ECategoryType
        displayName: string
        icon: IconKey
    }
    setSelectedCategory: (category: { id: X2ECategoryType; displayName: string; icon: IconKey }) => void
    filteredApps: X2EDapp[]
    isLoading: boolean
    allApps: X2EDapp[] | undefined
}

export const useX2ECategoryFiltering = (): UseX2ECategoryFilteringReturn => {
    const [selectedCategoryId, setSelectedCategoryId] = useState(X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY)
    const categories = useX2ECategories()
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId) ?? categories[0]

    const { data: allApps, isLoading } = useVeBetterDaoDapps()

    const filteredApps = useMemo(() => {
        if (!allApps) return []

        const filtered = allApps.filter(dapp => dapp.categories?.includes(selectedCategory.id) || false)

        return [...filtered].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    }, [allApps, selectedCategory.id])

    const handleCategoryChange = (category: { id: X2ECategoryType; displayName: string; icon: IconKey }) => {
        setSelectedCategoryId(category.id)
    }

    return {
        selectedCategory,
        setSelectedCategory: handleCategoryChange,
        filteredApps,
        isLoading,
        allApps,
    }
}
