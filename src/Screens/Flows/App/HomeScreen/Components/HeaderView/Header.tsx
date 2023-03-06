import React from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"

type Props = {
    action: () => void
}

export const Header = ({ action }: Props) => {
    const theme = useTheme()
    return (
        <BaseView
            w={100}
            px={20}
            orientation="row"
            align="center"
            justify="space-between">
            <BaseView align="flex-start" selfAlign="flex-start">
                <BaseText typographyFont="body">Welcome to</BaseText>
                <BaseText typographyFont="largeTitle">VeWorld</BaseText>
            </BaseView>

            <BaseIcon
                name={"add-sharp"}
                size={32}
                bg={theme.colors.secondary}
                action={action}
            />
        </BaseView>
    )
}
