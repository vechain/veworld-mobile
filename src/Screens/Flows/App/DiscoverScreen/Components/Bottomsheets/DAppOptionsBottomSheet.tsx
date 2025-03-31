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

        const dispatch = useAppDispatch()

        const onOpenDAppPress = useCallback(() => {
            if (selectedDApp) {
                onClose?.()
                nav.navigate(Routes.BROWSER, { url: selectedDApp.href })

                track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: selectedDApp.href,
                })

                setTimeout(() => {
                    dispatch(addNavigationToDApp({ href: selectedDApp.href, isCustom: selectedDApp.isCustom ?? false }))
                }, 1000)
            }
        }, [selectedDApp, onClose, nav, track, dispatch])

        const onSeeOnVBDPress = useCallback(() => {
            onClose?.()
            Linking.openURL(`https://governance.vebetterdao.org/apps/${selectedDApp?.veBetterDaoId}`)
        }, [onClose, selectedDApp?.veBetterDaoId])

        const Actions: FastAction[] = useMemo(
            () => [
                {
                    name: "Open dApp",
                    action: onOpenDAppPress,
                    icon: <BaseIcon name="icon-arrow-link" size={16} color={theme.colors.actionBottomSheet.icon} />,
                    testID: "Open_Dapp_Link",
                    disabled: false,
                },
                {
                    name: "See on VeBetterDAO",
                    action: onSeeOnVBDPress,
                    icon: <BaseIcon name="icon-arrow-link" size={16} color={theme.colors.actionBottomSheet.icon} />,
                    testID: "Open_VBD_Link",
                    disabled: false,
                },
                {
                    name: bookmarkedDApps.isBookMarked ? "Remove from Favorite dApps" : "Add to Favorite dApps",
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
                },
            ],
            [bookmarkedDApps, onClose, onOpenDAppPress, onSeeOnVBDPress, theme.colors.actionBottomSheet.icon],
        )

        const computeSnappoints = useMemo(() => {
            if (Actions.length < 5) {
                return ["35%"]
            }

            return ["35%", "45%", "55%", "75%"]
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
