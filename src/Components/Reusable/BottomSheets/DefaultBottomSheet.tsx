import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useThemedStyles } from "~Hooks"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

type Props = {
    iconName?: string
    // temporary until we have the new icons set up
    iconComponent?: React.ReactNode
    title: string
    description: string
    mainButton?: { label: string; action: () => void; bg?: string; caution?: boolean }
    secondaryButton?: { label: string; action: () => void }
    onClose: () => void
}

export const DefaultBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ iconName, iconComponent, title, description, mainButton, secondaryButton }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const handlePressMain = useCallback(() => {
            if (mainButton?.action) {
                mainButton?.action()
            }
        }, [mainButton])

        const handlePressSecondary = useCallback(() => {
            if (secondaryButton?.action) {
                secondaryButton.action()
            }
        }, [secondaryButton])

        const calculateTextColor = useMemo(() => {
            return mainButton?.caution ? COLORS.WHITE : undefined
        }, [mainButton?.caution])

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
                        {iconName && (
                            <BaseIcon name={iconName} style={styles.icon} size={66} color={theme.colors.text} />
                        )}
                        {iconComponent && iconComponent}
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
                    {mainButton && (
                        <BaseButton
                            w={100}
                            style={mainButton.caution && styles.cautionButton}
                            textColor={calculateTextColor}
                            typographyFont="buttonMedium"
                            haptics="Light"
                            title={mainButton.label}
                            action={handlePressMain}
                        />
                    )}
                    {mainButton && secondaryButton && <BaseSpacer height={12} />}
                    {secondaryButton && (
                        <BaseButton
                            w={100}
                            style={styles.secondaryButton}
                            variant={"outline"}
                            textColor={theme.colors.text}
                            typographyFont="buttonMedium"
                            haptics="Light"
                            title={secondaryButton?.label}
                            action={handlePressSecondary}
                        />
                    )}
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
        cautionButton: {
            backgroundColor: COLORS.RED_600,
            borderColor: COLORS.RED_600,
        },
        bottomSheet: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 8,
        },
        secondaryButton: {
            borderRadius: 8,
            paddingVertical: 12,
            borderColor: theme.colors.text,
            backgroundColor: COLORS.TRANSPARENT,
        },
    })
