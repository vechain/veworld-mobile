import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"

export type ListEmptyResultsProps = {
    onClick?: () => void
    title?: string
    subtitle: string
    subtitleColor?: string
    icon: IconKey
    iconColor?: string
    iconStyle?: StyleProp<ViewStyle>
    testID?: string
    minHeight?: number
}

export const ListEmptyResults = ({
    onClick,
    title,
    subtitle,
    subtitleColor,
    icon,
    iconColor,
    testID,
    minHeight,
    iconStyle,
}: ListEmptyResultsProps) => {
    const theme = useTheme()

    return (
        <BaseView
            testID={testID}
            flex={1}
            justifyContent="center"
            alignItems="center"
            style={minHeight ? { minHeight } : undefined}>
            <BaseIcon name={icon} size={32} color={iconColor || theme.colors.text} style={iconStyle} />
            <BaseSpacer height={24} />
            <BaseText mx={20} typographyFont="body" color={subtitleColor || theme.colors.text} align="center">
                {subtitle}
            </BaseText>
            <BaseSpacer height={16} />
            {onClick && title && (
                <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                    <BaseButton action={onClick} title={title} haptics="Light" />
                </BaseView>
            )}
        </BaseView>
    )
}
