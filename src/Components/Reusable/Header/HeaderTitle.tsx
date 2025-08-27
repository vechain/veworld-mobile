import { BaseIcon, BaseText, BaseView } from "~Components"
import React from "react"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"

type HeaderTitleProps = {
    title: string
    leftIconName?: IconKey
    testID?: string
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, leftIconName, testID }) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" alignItems="center" gap={16}>
            {leftIconName && <BaseIcon name={leftIconName} size={24} color={theme.colors.text} />}
            <BaseText testID={testID} color={theme.colors.headerTitle} typographyFont="headerTitle">
                {title}
            </BaseText>
        </BaseView>
    )
}
