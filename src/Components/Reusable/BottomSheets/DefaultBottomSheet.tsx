import React, { useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useThemedStyles } from "~Hooks"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { IconKey } from "~Model"

type Props = {
    icon: IconKey
    title: string
    description: string
    mainButton?: React.ReactNode
    secondaryButton?: React.ReactNode
    enablePanDownToClose?: boolean
    iconSize?: number
    testId?: string
    buttonsInLine?: boolean
    textColor?: string
    backgroundColor?: string
}

export const DefaultBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    (
        {
            icon,
            title,
            description,
            mainButton,
            secondaryButton,
            enablePanDownToClose = true,
            iconSize = 66,
            testId,
            buttonsInLine = false,
            backgroundColor,
            textColor,
        },
        ref,
    ) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const buttonGroup = useMemo(() => {
            if (buttonsInLine) {
                return (
                    <BaseView justifyContent="center" alignItems="center" flexDirection="row" gap={12}>
                        {secondaryButton}
                        {mainButton}
                    </BaseView>
                )
            }

            return (
                <BaseView justifyContent="center" alignItems="center" gap={12}>
                    {mainButton}
                    {mainButton && secondaryButton && <BaseSpacer height={12} />}
                    {secondaryButton}
                </BaseView>
            )
        }, [mainButton, secondaryButton, buttonsInLine])
        return (
            <BaseBottomSheet
                ref={ref}
                dynamicHeight
                noMargins
                style={styles.bottomSheet}
                backgroundStyle={{ ...styles.bottomSheet, backgroundColor }}
                enablePanDownToClose={enablePanDownToClose}
                blurBackdrop={true}>
                <BaseView testID={testId}>
                    {enablePanDownToClose ? <BaseSpacer height={16} /> : <BaseSpacer height={32} />}
                    <BaseView justifyContent="center" alignItems="center">
                        <BaseIcon name={icon} style={styles.icon} size={iconSize} color={theme.colors.text} />
                        <BaseSpacer height={24} />
                        <BaseText align="center" typographyFont="subSubTitleSemiBold" color={textColor}>
                            {title}
                        </BaseText>
                        <BaseSpacer height={12} />
                        <BaseText align="center" typographyFont="body" lineHeight={20} color={textColor}>
                            {description}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={24} />
                    {buttonGroup}
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
        },
    })
