import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useRef } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseView, Layout } from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import { X2EAppsBottomSheet } from "./X2EApps/X2EAppsBottomSheet"
import { SortableKeys } from "../DiscoverScreen/Components/Bottomsheets"

const styles = StyleSheet.create({
    button: {
        maxWidth: 300,
    },
})

export const AppsScreen = () => {
    const { LL } = useI18nContext()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const [sortedBy, setSortedBy] = React.useState<SortableKeys>("asc")

    const {
        ref: appsBottomSheetRef,
        onOpen: onOpenAppsBottomSheet,
        onClose: onCloseAppsBottomSheet,
    } = useBottomSheetModal()

    const handleSortChange = useCallback((sort: SortableKeys) => {
        setSortedBy(sort)
    }, [])

    return (
        <Layout
            title={LL.COMMON_DAPPS()}
            body={
                <BaseView flex={1} px={16} justifyContent="center" alignItems="center">
                    <BaseButton action={onOpenAppsBottomSheet} variant="solid" size="lg" w={100} style={styles.button}>
                        {LL.DISCOVER_SEARCH_CTA()}
                    </BaseButton>

                    <X2EAppsBottomSheet
                        ref={appsBottomSheetRef}
                        onDismiss={onCloseAppsBottomSheet}
                        sortedBy={sortedBy}
                        onSortChange={handleSortChange}
                    />
                </BaseView>
            }
        />
    )
}
