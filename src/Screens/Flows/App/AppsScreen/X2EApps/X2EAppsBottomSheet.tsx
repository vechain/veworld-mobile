import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { X2EAppsList } from "./components"
import { X2ECategoryFilters } from "./components/X2ECategoryFilters"
import { useX2ECategoryFiltering } from "./hooks/useX2ECategoryFiltering"

type X2EAppsBottomSheetProps = {
    onDismiss?: () => void
}

export const X2EAppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(({ onDismiss }, ref) => {
    const theme = useTheme()
    const [openItemId, setOpenItemId] = useState<string | null>(null)

    const { selectedCategory, setSelectedCategory, filteredApps, isLoading } = useX2ECategoryFiltering()

    const handleToggleOpenItem = useCallback((itemId: string) => {
        setOpenItemId(prevId => (prevId === itemId ? null : itemId))
    }, [])

    const headerContent = useMemo(
        () => (
            <BaseView>
                <BaseView flexDirection="row" gap={16} alignItems="center" px={24} mt={16}>
                    <BaseIcon name={selectedCategory.icon} size={32} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="biggerTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {selectedCategory.displayName}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={32} />
                <X2ECategoryFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            </BaseView>
        ),
        [selectedCategory, theme.colors.editSpeedBs.title, setSelectedCategory],
    )

    return (
        <BaseBottomSheet
            snapPoints={["93%"]}
            ref={ref}
            onDismiss={onDismiss}
            floating={false}
            noMargins={true}
            backgroundStyle={{ backgroundColor: theme.colors.card }}>
            {headerContent}
            <X2EAppsList
                apps={filteredApps}
                isLoading={isLoading}
                onDismiss={onDismiss}
                openItemId={openItemId}
                onToggleOpenItem={handleToggleOpenItem}
            />
        </BaseBottomSheet>
    )
})
