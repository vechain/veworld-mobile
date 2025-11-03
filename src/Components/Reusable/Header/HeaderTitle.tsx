import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { typography } from "~Constants"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"

type HeaderTitleProps = {
    title: string
    leftIconName?: IconKey
    testID?: string
    typographyFont?: keyof typeof typography.defaults
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({
    title,
    leftIconName,
    testID,
    typographyFont = "subTitleSemiBold",
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
                align="center">
                {title}
            </BaseText>
        </BaseView>
    )
}
