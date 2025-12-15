import React from "react"
import { StyleProp, TextStyle } from "react-native"
import { BaseIcon, BaseText, BaseTextProps, BaseView } from "~Components"
import { typography } from "~Constants"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"

type HeaderTitleProps = {
    title: string
    leftIconName?: IconKey
    testID?: string
    typographyFont?: keyof typeof typography.defaults
    align?: BaseTextProps["align"]
    style?: StyleProp<TextStyle>
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({
    title,
    leftIconName,
    testID,
    typographyFont = "subTitleSemiBold",
    align = "center",
    style,
}) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" alignItems="center" gap={16} flex={1}>
            {leftIconName && <BaseIcon name={leftIconName} size={24} color={theme.colors.text} />}
            <BaseText
                testID={testID}
                color={theme.colors.headerTitle}
                typographyFont={typographyFont}
                flex={1}
                flexDirection="row"
                numberOfLines={1}
                align={align}
                style={style}>
                {title}
            </BaseText>
        </BaseView>
    )
}
