import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BottomSheetAction } from "~Components"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import { useDappBookmarking, useScrollableBottomSheet, useThemedStyles } from "~Hooks"
import { FastAction } from "~Model"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useDAppActions } from "../../Hooks"

type Props = {
    selectedDApp?: DiscoveryDApp
    onClose?: () => void
    onNavigateToDApp?: (dapp: DiscoveryDApp) => void
    stackBehavior?: "push" | "replace"
}

const ItemSeparatorComponent = () => <BaseSpacer height={14} />

export const DAppOptionsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ selectedDApp, onClose, stackBehavior = "push" }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const bookmarkedDApps = useDappBookmarking(selectedDApp?.href, selectedDApp?.name)
        const nav = useNavigation()
        const { LL } = useI18nContext()
        const { onDAppPress } = useDAppActions()

        const onOpenDAppPress = useCallback(() => {
            if (selectedDApp) {
                onDAppPress(selectedDApp).then(() => onClose?.())
            }
        }, [selectedDApp, onDAppPress, onClose])

        const onSeeOnVBDPress = useCallback(() => {
            onClose?.()
            nav.navigate(Routes.BROWSER, {
                url: `https://governance.vebetterdao.org/apps/${selectedDApp?.veBetterDaoId}`,
            })
        }, [nav, onClose, selectedDApp?.veBetterDaoId])

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
            onOpenDAppPress,
            onSeeOnVBDPress,
            selectedDApp?.veBetterDaoId,
            theme.colors.actionBottomSheet.icon,
        ])

        const computeSnappoints = useMemo(() => {
            if (Actions.length < 3) {
                return ["30%"]
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
                stackBehavior={stackBehavior}
                floating={true}
                backgroundStyle={styles.layout}>
                <BottomSheetFlatList
                    data={Actions}
                    keyExtractor={action => action.name}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    renderItem={({ item }) => <BottomSheetAction key={item.testID} {...item} />}
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
