import { useScrollToTop } from "@react-navigation/native"
import React, { useRef } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseView, Layout } from "~Components"
import { useBottomSheetModal, useFetchFeaturedDApps, useVeBetterDaoDapps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { X2EAppsBottomSheet } from "./Components"

const styles = StyleSheet.create({
    button: {
        maxWidth: 300,
    },
})

export const AppsScreen = () => {
    const { LL } = useI18nContext()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    useFetchFeaturedDApps()

    const { data: allApps, isLoading } = useVeBetterDaoDapps()

    const {
        ref: appsBottomSheetRef,
        onOpen: onOpenAppsBottomSheet,
        onClose: onCloseAppsBottomSheet,
    } = useBottomSheetModal()

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
                        allApps={allApps}
                        isLoading={isLoading}
                    />
                </BaseView>
            }
        />
    )
}
