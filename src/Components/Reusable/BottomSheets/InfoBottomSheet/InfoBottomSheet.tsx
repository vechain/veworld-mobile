import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useThemedStyles } from "~Hooks/useTheme"

type BaseInfoBottomSheetProps = {
    bsRef: RefObject<BottomSheetModalMethods>
    title: string
    description: string
}

export const InfoBottomSheet = ({ bsRef, title, description }: BaseInfoBottomSheetProps) => {
    const { ref, onClose } = useBottomSheetModal({ externalRef: bsRef })
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseBottomSheet
            ref={ref}
            dynamicHeight
            enableBackToClose={false}
            enablePanDownToClose={false}
            floating
            backgroundStyle={styles.bottomSheetBackground}
            scrollable={false}>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeButton}>
                <BaseIcon name="icon-x" size={16} color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} />
            </TouchableOpacity>
            <BaseView pt={8}>
                <BaseView flexDirection="row" gap={12} alignItems="center" position="relative">
                    <BaseIcon name="icon-info" size={24} color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE} />
                    <BaseText
                        flex={0.9}
                        typographyFont="subSubTitleSemiBold"
                        color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}>
                        {title}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={24} />
                <BaseText typographyFont="body" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}>
                    {description}
                </BaseText>
            </BaseView>
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        bottomSheetBackground: {
            backgroundColor: theme.colors.newBottomSheet.background,
        },
        closeButton: {
            position: "absolute",
            right: 16,
            top: 16,
            padding: 8,
            borderRadius: 100,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_200,
            zIndex: 100,
        },
    })
