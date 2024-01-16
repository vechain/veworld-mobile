import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, StringUtils, useThemedStyles } from "~Common"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { Network } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    network: Network
    onPress: (network: Network) => void
    rightIcon?: string
    isSelected?: boolean
    flex?: number
}
export const NetworkBox: React.FC<Props> = ({
    network,
    onPress,
    rightIcon,
    isSelected = false,
    flex,
}) => {
    const { LL } = useI18nContext()
    const { theme, styles: themedStyles } = useThemedStyles(baseStyles)
    const style = isSelected ? themedStyles.selected : themedStyles.notSelected

    const handleOnPress = useCallback(
        () => onPress(network),
        [onPress, network],
    )

    return (
        <BaseTouchableBox
            flex={flex}
            action={handleOnPress}
            innerContainerStyle={style}
            justifyContent="space-between">
            <BaseView flexDirection="column">
                <BaseView flexDirection="row">
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
