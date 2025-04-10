import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { Linking, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BottomSheetAction, BaseSpacer } from "~Components"
import { AnalyticsEvent, ColorThemeType, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useDappBookmarking, useThemedStyles, useScrollableBottomSheet } from "~Hooks"
import { Routes } from "~Navigation"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { FastAction } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    selectedDApp?: DiscoveryDApp
    onClose?: () => void
}

const ItemSeparatorComponent = () => <BaseSpacer height={14} />

export const DAppOptionsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ selectedDApp, onClose }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const bookmarkedDApps = useDappBookmarking(selectedDApp?.href, selectedDApp?.name)
        const nav = useNavigation()
        const track = useAnalyticTracking()
        const { LL } = useI18nContext()
        const dispatch = useAppDispatch()

        const onOpenDAppPress = useCallback(() => {
            if (selectedDApp) {
                track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: selectedDApp.href,
                })

                setTimeout(() => {
                    dispatch(addNavigationToDApp({ href: selectedDApp.href, isCustom: selectedDApp.isCustom ?? false }))
                }, 1000)

                onClose?.()
                nav.navigate(Routes.BROWSER, { url: selectedDApp.href })
            }
        }, [selectedDApp, onClose, nav, track, dispatch])

        const onSeeOnVBDPress = useCallback(() => {
            onClose?.()
            Linking.openURL(`https://governance.vebetterdao.org/apps/${selectedDApp?.veBetterDaoId}`)
        }, [onClose, selectedDApp?.veBetterDaoId])

        const Actions: FastAction[] = useMemo(() => {
            const actionList = [
                {
                    name: LL.BTN_OPEN_DAPP(),
                    action: onOpenDAppPress,
                    icon: <BaseIcon name="icon-arrow-link" size={16} color={theme.colors.actionBottomSheet.icon} />,
                    testID: "Open_Dapp_Link",
                    disabled: false,
                },
            ]
            if (selectedDApp?.veBetterDaoId) {
                actionList.push({
                    name: LL.BTN_SEE_ON_VBD(),
                    action: onSeeOnVBDPress,
                    icon: <BaseIcon name="icon-arrow-link" size={16} color={theme.colors.actionBottomSheet.icon} />,
                    testID: "Open_VBD_Link",
                    disabled: false,
                })
            }
            actionList.push({
                name: bookmarkedDApps.isBookMarked ? LL.BTN_REMOVE_FROM_FAVORITES() : LL.BTN_ADD_TO_FAVORITES(),
                action: () => {
                    onClose?.()
                    bookmarkedDApps.toggleBookmark()
                },
                icon: (
                    <BaseIcon
                        name={bookmarkedDApps.isBookMarked ? "icon-star-on" : "icon-star"}
                        size={16}
                        color={theme.colors.actionBottomSheet.icon}
                    />
                ),
                testID: bookmarkedDApps.isBookMarked ? "Remove_Favorite_Btn" : "Add_Favorite_Btn",
                disabled: false,
            })
            return actionList
        }, [
            LL,
            bookmarkedDApps,
            onClose,
            onOpenDAppPress,
            onSeeOnVBDPress,
            selectedDApp?.veBetterDaoId,
            theme.colors.actionBottomSheet.icon,
        ])

        const computeSnappoints = useMemo(() => {
            if (Actions.length < 3) {
                return ["25%"]
            }
            if (Actions.length < 5) {
                return ["35%"]
            }

            return ["25%", "35%"]
        }, [Actions.length])

        const { flatListScrollProps, handleSheetChangePosition } = useScrollableBottomSheet({
            data: Actions,
            snapPoints: computeSnappoints,
        })

        return (
            <BaseBottomSheet
                ref={ref}
                snapPoints={computeSnappoints}
                onDismiss={onClose}
                onChange={handleSheetChangePosition}
                blurBackdrop
                backgroundStyle={styles.layout}>
                <BottomSheetFlatList
                    data={Actions}
                    keyExtractor={action => action.name}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    renderItem={({ item }) => <BottomSheetAction {...item} />}
                    {...flatListScrollProps}
                />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
    })
