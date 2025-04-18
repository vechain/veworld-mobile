import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { selectTabs, useAppDispatch, useAppSelector, Tab, closeAllTabs } from "~Storage/Redux"
import { TabViewCard } from "./Components"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

export const TabsManagerScreen = () => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListBrowser>>()
    const { styles, theme } = useThemedStyles(baseStyles)

    const tabs = useAppSelector(selectTabs)

    const dispatch = useAppDispatch()

    const onCloseAll = useCallback(() => {
        dispatch(closeAllTabs())
    }, [dispatch])

    const onNewTab = useCallback(() => {
        nav.replace(Routes.DISCOVER_SEARCH)
    }, [nav])

    const onDone = useCallback(() => {
        nav.navigate(Routes.DISCOVER)
    }, [nav])

    const renderTab = useCallback(({ item }: { item: Tab }) => {
        return <TabViewCard tab={item} />
    }, [])

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    return (
        <BaseSafeArea>
            <BaseView flex={1}>
                <BaseView flex={1} px={24} pt={16}>
                    <BaseView flexDirection="row" justifyContent="center" alignItems="center">
                        <BaseText typographyFont="captionMedium">{`${tabs.length} tabs`}</BaseText>
                    </BaseView>
                    <BaseView style={styles.listContainer}>
                        <FlatList
                            data={tabs}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            keyExtractor={item => item.id}
                            renderItem={renderTab}
                            ItemSeparatorComponent={renderSeparator}
                        />
                    </BaseView>
                </BaseView>
                <BaseView style={styles.footerContainer}>
                    <BaseTouchable
                        disabled={tabs.length === 0}
                        style={[styles.footerButton, styles.footerButtonStart]}
                        onPress={onCloseAll}>
                        <BaseText
                            typographyFont="bodyMedium"
                            color={tabs.length === 0 ? theme.colors.textDisabled : theme.colors.text}>
                            {"Close all"}
                        </BaseText>
                    </BaseTouchable>
                    <BaseTouchable style={styles.footerButton} onPress={onNewTab}>
                        <BaseIcon name={"icon-plus"} size={20} />
                    </BaseTouchable>
                    <BaseTouchable style={[styles.footerButton, styles.footerButtonEnd]} onPress={onDone}>
                        <BaseText typographyFont="bodyMedium">{"Done"}</BaseText>
                    </BaseTouchable>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = () =>
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
            paddingTop: 8,
            paddingBottom: 40,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#E7E9EB", //TODO: Remove this in favor of theme
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
