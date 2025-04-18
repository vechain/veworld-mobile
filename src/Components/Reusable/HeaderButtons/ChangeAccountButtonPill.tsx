import React from "react"
import { BaseIcon, BaseSpacer, HeaderIconButton } from "~Components"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"

type Props = {
    testID?: string
    action: () => void
}

export const ChangeAccountButtonPill = ({ testID, action }: Props) => {
    const theme = useTheme()

    return (
        <HeaderIconButton testID={testID} action={action}>
            <BaseIcon
                size={12}
                name="icon-arrow-left-right"
                color={theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_400}
            />
            <BaseSpacer width={6} />
            <BaseIcon size={16} name="icon-wallet" color={theme.isDark ? COLORS.PRIMARY_50 : COLORS.GREY_600} />
        </HeaderIconButton>
    )
}
