import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, useMemo } from "react"
import { Share, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers"
import { ColorThemeType } from "~Constants"
import { useCopyClipboard, useDappBookmarking, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"

type Props = {}

type BottomSheetAction = {
    id: string
    icon: IconKey
    label: string
    onPress: () => void
}

export const BrowserBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>((_, ref) => {
    const { LL } = useI18nContext()
    const { isDapp, navigationState } = useInAppBrowser()
    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url)
    const { onCopyToClipboard } = useCopyClipboard()
    const { styles, theme } = useThemedStyles(baseStyles)

    const actions: BottomSheetAction[] = useMemo(() => {
        const favoriteItem = isBookMarked
            ? {
                  id: "favorite",
                  icon: "icon-star-on" as const,
                  label: LL.BROWSER_REMOVE_FAVORITE_DAPPS(),
                  onPress: toggleBookmark,
              }
            : {
                  id: "favorite",
                  icon: "icon-star" as const,
                  label: LL.BROWSER_ADD_FAVORITE_DAPPS(),
                  onPress: toggleBookmark,
              }

        return [
            {
                id: "copy",
                icon: "icon-copy",
                label: LL.BROWSER_COPY_LINK(),
                onPress: () => onCopyToClipboard(navigationState?.url ?? "", LL.BROWSER_COPY_LINK_SUCCESS()),
            },
            {
                id: "share",
                icon: "icon-share-2",
                label: LL.BROWSER_SHARE(),
                onPress: () => {
                    Share.share({
                        message: navigationState?.title || new URL(navigationState?.url || "").href,
                        url: navigationState?.url ?? "",
                    })
                },
            },
            ...(isDapp ? [favoriteItem] : []),
        ]
    }, [LL, isBookMarked, isDapp, navigationState?.title, navigationState?.url, onCopyToClipboard, toggleBookmark])

    return (
        <BaseBottomSheet dynamicHeight ref={ref} blurBackdrop backgroundStyle={styles.rootSheet}>
            <BaseView w={100} style={styles.actionContainer}>
                {actions.map(action => (
                    <BaseTouchable key={action.id} style={styles.actionItemContainer} action={action.onPress}>
                        <BaseIcon
                            name={action.icon}
                            size={16}
                            iconPadding={8}
                            bg={theme.colors.actionBottomSheet.iconBackground}
                            color={theme.colors.actionBottomSheet.icon}
                        />
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.title}>
                            {action.label}
                        </BaseText>
                    </BaseTouchable>
                ))}
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        actionContainer: {
            flexDirection: "column",
            gap: 16,
        },
        actionItemContainer: {
            gap: 24,
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            paddingVertical: 8,
        },
        rootSheet: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
    })
}
