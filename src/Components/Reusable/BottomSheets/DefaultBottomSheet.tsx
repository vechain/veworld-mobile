import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useThemedStyles } from "~Hooks"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

type Props = {
    icon: string | React.ReactNode
    title: string
    description: string
    mainButton?: React.ReactNode
    secondaryButton?: React.ReactNode
}

export const DefaultBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ icon, title, description, mainButton, secondaryButton }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        return (
            <BaseBottomSheet
                ref={ref}
                dynamicHeight
                noMargins
                style={styles.bottomSheet}
                backgroundStyle={styles.bottomSheet}
                blurBackdrop={true}>
                <BaseView>
                    <BaseSpacer height={16} />
                    <BaseView justifyContent="center" alignItems="center">
                        {typeof icon === "string" ? (
                            <BaseIcon name={icon} style={styles.icon} size={66} color={theme.colors.text} />
                        ) : (
                            icon
                        )}
                        <BaseSpacer height={26} />
                        <BaseText align="center" typographyFont="subSubTitleMedium">
                            {title}
                        </BaseText>
                        <BaseSpacer height={12} />
                        <BaseText align="center" typographyFont="body">
                            {description}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={24} />
                    {mainButton}
                    {mainButton && secondaryButton && <BaseSpacer height={12} />}
                    {secondaryButton}
                    <BaseSpacer height={16} />
                </BaseView>
                <BaseSpacer height={32} />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        icon: {
            color: theme.colors.text,
        },
        bottomSheet: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 8,
        },
    })
