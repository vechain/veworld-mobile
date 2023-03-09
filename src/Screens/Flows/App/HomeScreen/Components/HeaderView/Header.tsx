import React, { memo } from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"

type Props = {
    action: () => void
}

export const Header = memo(({ action }: Props) => {
    const theme = useTheme()
    return (
        <BaseView
            w={100}
            px={20}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <BaseView alignItems="flex-start" alignSelf="flex-start">
                <BaseText typographyFont="body">Welcome to</BaseText>
                <BaseText typographyFont="largeTitle">VeWorld</BaseText>
            </BaseView>

            <BaseIcon
                name={"wallet-outline"}
                size={24}
                bg={theme.colors.secondary}
                action={action}
            />
        </BaseView>
    )
})
