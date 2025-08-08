import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseTouchable,
    BaseSpacer,
    BaseText,
    BaseView,
    HeaderStyleV2,
    HeaderTitle,
    Layout,
    BaseButton,
} from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { X2EAppsBottomSheet } from "~Screens/Flows/App/AppsScreen/Components"

export const AppsScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const { data: allApps, isLoading } = useVeBetterDaoDapps()

    const {
        ref: appsBottomSheetRef,
        onOpen: onOpenAppsBottomSheet,
        onClose: onCloseAppsBottomSheet,
    } = useBottomSheetModal()

    const goToSearch = useCallback(() => {
        nav.navigate(Routes.APPS_SEARCH)
    }, [nav])

    return (
        <Layout
            bg={theme.isDark ? COLORS.DARK_PURPLE : COLORS.WHITE}
            noBackButton
            fixedHeader={
                <BaseView style={HeaderStyleV2}>
                    <HeaderTitle
                        title={LL.APPS_SCREEN_TITLE()}
                        leftIconName="icon-apps"
                        testID="AppsScreen_HeaderTitle"
                    />
                    <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                        <BaseSpacer width={8} />
                        <BaseTouchable
                            action={goToSearch}
                            haptics="Light"
                            testID="AppsScreen_SearchButton"
                            style={styles.iconContainer}>
                            <BaseIcon name={"icon-search"} size={16} color={theme.colors.text} />
                        </BaseTouchable>
                    </BaseView>
                </BaseView>
            }
            body={
                <>
                    <BaseText>{"AppsScreen"}</BaseText>
                    <BaseView flex={1} px={16} justifyContent="center" alignItems="center">
                        <BaseButton action={onOpenAppsBottomSheet} variant="solid" size="lg" w={100}>
                            {LL.BTN_OPEN()}
                        </BaseButton>

                        <X2EAppsBottomSheet
                            ref={appsBottomSheetRef}
                            onDismiss={onCloseAppsBottomSheet}
                            allApps={allApps}
                            isLoading={isLoading}
                        />
                    </BaseView>
                </>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            padding: 8,
            borderRadius: 100,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_100,
        },
    })
