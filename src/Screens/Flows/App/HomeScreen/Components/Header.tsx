import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

type Props = {
    action: () => void
}

export const Header = ({ action }: Props) => {
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
                title={"add-sharp"}
                size={32}
                bg={"lime"}
                action={action}
            />
        </BaseView>
    )
}
