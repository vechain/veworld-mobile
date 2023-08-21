import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StringUtils } from "~Utils"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { Network } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    network: Network
    onPress?: (network: Network) => void
    rightIcon?: string
    isSelected?: boolean
    flex?: number
    activeOpacity?: number
}
export const NetworkBox: React.FC<Props> = ({
    network,
    onPress,
    rightIcon,
    isSelected = false,
    flex,
    activeOpacity,
}) => {
    const { LL } = useI18nContext()
    const { theme, styles: themedStyles } = useThemedStyles(baseStyles)
    const style = isSelected ? themedStyles.selected : themedStyles.notSelected

    const handleOnPress = useCallback(
        () => !!onPress && onPress(network),
        [onPress, network],
    )

    const paddingRightWithIcon = rightIcon ? 20 : 0

    return (
        <BaseTouchableBox
            haptics="Light"
            activeOpacity={activeOpacity}
            action={handleOnPress}
            innerContainerStyle={style}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                flex={flex}
                pr={paddingRightWithIcon}>
                <BaseView flexDirection="column" alignItems="flex-start">
                    <BaseView flexDirection="row" pr={paddingRightWithIcon}>
                        <BaseText typographyFont="button">
                            {StringUtils.capitalize(network.name)}
                        </BaseText>
                        {network.defaultNet && (
                            <BaseText pl={2} typographyFont="captionRegular">
                                ({LL.COMMON_LBL_DEFAULT()})
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseText pt={2} typographyFont="captionMedium">
                        {network.currentUrl}
                    </BaseText>
                </BaseView>
                {rightIcon && (
                    <BaseIcon name={rightIcon} color={theme.colors.text} />
                )}
            </BaseView>
        </BaseTouchableBox>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
    })
