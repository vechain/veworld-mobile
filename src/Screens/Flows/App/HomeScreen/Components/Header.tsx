import React from "react"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

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
                <BaseText font={Fonts.body}>Welcome to</BaseText>
                <BaseText font={Fonts.large_title}>VeWorld</BaseText>
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
