import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, StringUtils, useThemedStyles } from "~Common"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { Network } from "~Model"

type Props = {
    network: Network
    onPress: (network: Network) => void
    rightIcon?: string
    isSelected?: boolean
}
export const NetworkBox: React.FC<Props> = ({
    network,
    onPress,
    rightIcon,
    isSelected = false,
}) => {
    const { theme, styles: themedStyles } = useThemedStyles(baseStyles)

    const style = isSelected ? themedStyles.selected : themedStyles.notSelected

    const handleOnPress = useCallback(
        () => onPress(network),
        [onPress, network],
    )

    return (
        <BaseTouchableBox
            action={handleOnPress}
            innerContainerStyle={style}
            justifyContent="space-between">
            <BaseView flexDirection="column">
                <BaseText typographyFont="button">
                    {StringUtils.capitalize(network.name)}
                </BaseText>
                <BaseText pt={2} typographyFont="captionMedium">
                    {network.currentUrl}
                </BaseText>
            </BaseView>
            {rightIcon && (
                <BaseIcon name={rightIcon} color={theme.colors.text} />
            )}
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
