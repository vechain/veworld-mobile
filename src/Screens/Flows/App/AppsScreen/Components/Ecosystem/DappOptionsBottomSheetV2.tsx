import { TouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, RefObject, useCallback } from "react"
import { Share, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType, DiscoveryDApp } from "~Constants"
import { useBottomSheetModal, useDappBookmarking, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useDAppActions } from "~Screens/Flows/App/DiscoverScreen/Hooks"

const Content = ({ dapp, onClose }: { dapp: DiscoveryDApp; onClose: () => void }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.href)
    const { onDAppPress } = useDAppActions()

    const onBookmarkPress = useCallback(() => toggleBookmark(), [toggleBookmark])
    const onOpenDappPress = useCallback(async () => {
        await onDAppPress(dapp)
        onClose()
    }, [dapp, onClose, onDAppPress])

    const onShare = useCallback(() => {
        const url = `https://www.veworld.com/discover/browser/redirect/ul/${encodeURIComponent(dapp.href)}`
        Share.share({
            message: LL.SHARE_DAPP({ name: dapp.name, description: dapp.desc ?? "", url }),
            url,
        })
    }, [LL, dapp.desc, dapp.href, dapp.name])

    return (
        <BaseView px={24} gap={4} pb={16}>
            <TouchableOpacity style={styles.button} onPress={onOpenDappPress}>
                <BaseIcon
                    name="icon-arrow-link"
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                />
                <BaseText color={theme.colors.dappCard.name} typographyFont="bodySemiBold">
                    {LL.BTN_OPEN_DAPP()}
                </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onBookmarkPress}>
                <BaseIcon
                    name={isBookMarked ? "icon-star-on" : "icon-star-off"}
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                />
                <BaseText color={theme.colors.dappCard.name} typographyFont="bodySemiBold">
                    {isBookMarked ? LL.BTN_REMOVE_FROM_FAVORITE() : LL.BTN_ADD_TO_FAVORITE()}
                </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onShare}>
                <BaseIcon
                    name="icon-share"
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                />
                <BaseText color={theme.colors.dappCard.name} typographyFont="bodySemiBold">
                    {LL.BROWSER_SHARE()}
                </BaseText>
            </TouchableOpacity>
        </BaseView>
    )
}

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
}

export const DappOptionsBottomSheetV2 = ({ bsRef }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { onClose } = useBottomSheetModal({ externalRef: bsRef })

    return (
        <BaseBottomSheet<DiscoveryDApp>
            ref={bsRef}
            dynamicHeight
            bottomSafeArea={false}
            blurBackdrop
            backgroundStyle={styles.layout}
            noMargins
            floating>
            {dapp => <Content dapp={dapp} onClose={onClose} />}
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
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
