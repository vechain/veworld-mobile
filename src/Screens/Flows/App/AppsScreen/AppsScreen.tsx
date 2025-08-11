import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseTouchable,
    BaseView,
    HeaderStyleV2,
    HeaderTitle,
    Layout,
} from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { useIsNormalUser } from "~Hooks/useIsNormalUser"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { AppsBottomSheet } from "./Components/VeBetter"
import { EcosystemSection } from "./Components/Ecosystem"
import { ForYouCarousel } from "./Components/ForYouCarousel/ForYouCarousel"
import { NewUserForYouCarousel } from "./Components/ForYouCarousel/NewUserForYouCarousel"

export const AppsScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const isNormalUser = useIsNormalUser()

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
            noMargin
            fixedHeader={
                <BaseView style={[HeaderStyleV2, styles.header]}>
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
                    {isNormalUser ? <ForYouCarousel /> : <NewUserForYouCarousel />}
                    <BaseSpacer height={48} />
                    <EcosystemSection />
                    <BaseView flex={1} px={16} justifyContent="center" alignItems="center">
                        <BaseButton action={onOpenAppsBottomSheet} variant="solid" size="lg" w={100}>
                            {LL.BTN_OPEN()}
                        </BaseButton>

                        <AppsBottomSheet
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
        header: {
            paddingHorizontal: 16,
        },
    })
