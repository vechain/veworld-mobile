import { TouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { default as React, RefObject, useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useCollectionsBookmarking, useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

const URL_SUPPORT = "https://support.veworld.com"

const Content = ({
    collectionAddress,
    onClose,
    onOpenReport,
}: {
    collectionAddress: string
    onClose: () => void
    onOpenReport: () => void
}) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const navigation = useNavigation()
    const { navigateWithTab } = useBrowserTab()
    const { isFavorite, toggleFavoriteCollection } = useCollectionsBookmarking(collectionAddress)

    const onBookmarkPress = useCallback(() => {
        toggleFavoriteCollection()
        onClose()
    }, [toggleFavoriteCollection, onClose])

    const onReportPress = useCallback(async () => {
        navigateWithTab({
            url: URL_SUPPORT,
            title: LL.BTN_COLLECTION_ACTIONS_REPORT(),
            navigationFn(u) {
                navigation.navigate(Routes.BROWSER, { url: u })
            },
        })

        onClose()
    }, [onClose, LL, navigateWithTab, navigation])

    const onBlockPress = useCallback(() => {
        onClose()
        setTimeout(() => {
            onOpenReport()
        }, 300)
    }, [onClose, onOpenReport])

    return (
        <BaseView px={24} gap={12} pb={16}>
            <TouchableOpacity style={styles.button} onPress={onBookmarkPress}>
                <BaseIcon
                    name={isFavorite ? "icon-star-on" : "icon-star"}
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600}
                />
                <BaseText color={theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600} typographyFont="bodySemiBold">
                    {isFavorite ? LL.BTN_REMOVE_FROM_FAVORITE() : LL.BTN_COLLECTION_ACTIONS_FAVORITE()}
                </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onReportPress}>
                <BaseIcon
                    name="icon-alert-triangle"
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600}
                />
                <BaseText color={theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600} typographyFont="bodySemiBold">
                    {LL.BTN_COLLECTION_ACTIONS_REPORT()}
                </BaseText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onBlockPress}>
                <BaseIcon
                    name="icon-slash"
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.RED_300 : COLORS.RED_600}
                />
                <BaseText color={theme.isDark ? COLORS.RED_300 : COLORS.RED_600} typographyFont="bodySemiBold">
                    {LL.BTN_COLLECTION_ACTIONS_BLOCK()}
                </BaseText>
            </TouchableOpacity>
        </BaseView>
    )
}

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
    onOpenReport: () => void
}

export const CollectionActionsBottomSheet = ({ bsRef, onOpenReport }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { onClose } = useBottomSheetModal({ externalRef: bsRef })

    return (
        <BaseBottomSheet<string>
            ref={bsRef}
            dynamicHeight
            bottomSafeArea={false}
            blurBackdrop
            backgroundStyle={styles.layout}
            noMargins
            floating>
            {collectionAddress => (
                <Content collectionAddress={collectionAddress} onClose={onClose} onOpenReport={onOpenReport} />
            )}
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.newBottomSheet.background,
        },
        button: {
            flexDirection: "row",
            gap: 24,
            paddingVertical: 6,
            alignItems: "center",
        },
        icon: {
            padding: 8,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_100,
        },
    })
