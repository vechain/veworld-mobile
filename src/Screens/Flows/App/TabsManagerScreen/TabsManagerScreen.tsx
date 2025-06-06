import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, Layout } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { Tab, closeAllTabs, selectTabs, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { TabViewCard } from "./Components"
import { PlatformUtils } from "~Utils"

export const TabsManagerScreen = () => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListBrowser>>()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const tabs = useAppSelector(selectTabs)

    const dispatch = useAppDispatch()

    const onCloseAll = useCallback(() => {
        dispatch(closeAllTabs())
    }, [dispatch])

    const onNewTab = useCallback(() => {
        nav.replace(Routes.DISCOVER_SEARCH)
    }, [nav])

    const onDone = useCallback(() => {
        nav.goBack()
    }, [nav])

    const renderTab = useCallback(({ item }: { item: Tab }) => {
        return <TabViewCard tab={item} />
    }, [])

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    const buttonTextColor = useMemo(() => (theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_600), [theme.isDark])
    const disabledTextColor = useMemo(
        () => (theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300),
        [theme.isDark],
    )

    return (
        <Layout
            noBackButton
            noMargin
            footer={
                <BaseView style={styles.footerContainer}>
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
                        <BaseIcon name={"icon-plus"} size={20} color={buttonTextColor} />
                    </BaseTouchable>
                    <BaseTouchable style={[styles.footerButton, styles.footerButtonEnd]} onPress={onDone}>
                        <BaseText typographyFont="bodyMedium" color={buttonTextColor}>
                            {LL.COMMON_BTN_DONE()}
                        </BaseText>
                    </BaseTouchable>
                </BaseView>
            }
            fixedBody={
                <BaseView flex={1} p={24}>
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
            flex: 1,
            paddingVertical: 24,
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
            paddingBottom: PlatformUtils.isIOS() ? 42 : 8,
        },
        footerButton: {
            height: 40,
            paddingHorizontal: 16,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        footerButtonStart: {
            alignItems: "flex-start",
        },
        footerButtonEnd: {
            alignItems: "flex-end",
        },
    })
