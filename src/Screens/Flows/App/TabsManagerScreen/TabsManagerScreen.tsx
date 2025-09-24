import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, Platform, StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSpacer,
    BaseStatusBar,
    BaseText,
    BaseTouchable,
    BaseView,
    Layout,
    useFeatureFlags,
} from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles, useTabManagement } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListApps, RootStackParamListBrowser, Routes } from "~Navigation"
import { Tab } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { TabViewCard } from "./Components"

export const TabsManagerScreen = () => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListApps & RootStackParamListBrowser>>()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { betterWorldFeature } = useFeatureFlags()
    const { tabs, closeAllTabs } = useTabManagement()

    const onCloseAll = useCallback(() => {
        closeAllTabs()
    }, [closeAllTabs])

    const onNewTab = useCallback(() => {
        if (betterWorldFeature.appsScreen.enabled) {
            nav.replace(Routes.APPS_SEARCH)
        } else {
            nav.replace(Routes.DISCOVER_SEARCH)
        }
    }, [betterWorldFeature.appsScreen.enabled, nav])

    const onDone = useCallback(() => {
        nav.goBack()
    }, [nav])

    const renderTab = useCallback(({ item }: { item: Tab }) => {
        return <TabViewCard tab={item} />
    }, [])

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    const iconButtonTextColor = useMemo(() => (theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600), [theme.isDark])
    const buttonTextColor = useMemo(() => (theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600), [theme.isDark])
    const disabledTextColor = useMemo(
        () => (theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300),
        [theme.isDark],
    )

    return (
        <Layout
            bg={COLORS.DARK_PURPLE}
            noBackButton
            noMargin
            footer={
                <BaseView style={styles.footerContainer}>
                    {Platform.OS === "ios" && <BaseStatusBar hero={true} />}
                    <BaseTouchable
                        disabled={tabs.length === 0}
                        style={[styles.footerButton, styles.footerButtonStart]}
                        onPress={onCloseAll}>
                        <BaseText
                            typographyFont="bodyMedium"
                            color={tabs.length === 0 ? disabledTextColor : buttonTextColor}>
                            {LL.CLOSE_ALL()}
                        </BaseText>
                    </BaseTouchable>
                    <BaseTouchable style={styles.footerButton} onPress={onNewTab}>
                        <BaseIcon
                            name={"icon-plus"}
                            size={16}
                            color={iconButtonTextColor}
                            bg={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200}
                            style={styles.footerIcon}
                        />
                    </BaseTouchable>
                    <BaseTouchable style={[styles.footerButton, styles.footerButtonEnd]} onPress={onDone}>
                        <BaseText typographyFont="bodyMedium" color={buttonTextColor}>
                            {LL.COMMON_BTN_DONE()}
                        </BaseText>
                    </BaseTouchable>
                </BaseView>
            }
            fixedBody={
                <BaseView flex={1} px={24} pt={8} bg={theme.colors.tabsFooter.background} style={styles.listContainer}>
                    <BaseText mb={8} align="center" typographyFont="bodyMedium" color={buttonTextColor}>
                        {tabs.length} {tabs.length === 1 ? "tab" : "tabs"}
                    </BaseText>
                    <FlatList
                        data={tabs}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        keyExtractor={item => item.id}
                        renderItem={renderTab}
                        ItemSeparatorComponent={renderSeparator}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
            padding: 16,
        },
        listContainer: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        columnWrapper: {
            justifyContent: "space-between",
            gap: 16,
        },
        footerContainer: {
            paddingVertical: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.colors.tabsFooter.background,
            paddingBottom: PlatformUtils.isIOS() ? 32 : 8,
        },
        footerButton: {
            height: 40,
            paddingHorizontal: 16,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        footerIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
        footerButtonStart: {
            alignItems: "flex-start",
        },
        footerButtonEnd: {
            alignItems: "flex-end",
        },
    })
