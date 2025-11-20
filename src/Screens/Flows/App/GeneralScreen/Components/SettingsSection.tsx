import React, { PropsWithChildren } from "react"
import { ViewProps } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks/useTheme"
import { IconKey } from "~Model"

type Props = {
    icon: IconKey
    title: string
    children: React.ReactNode
}

const SettingsSection = ({ icon, title, children }: Props) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="column" gap={24} p={24} bg={theme.colors.settingsSection.background} borderRadius={12}>
            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start" gap={12}>
                <BaseIcon name={icon} size={16} color={theme.colors.settingsSection.title} />
                <BaseText typographyFont="bodySemiBold" color={theme.colors.settingsSection.title}>
                    {title}
                </BaseText>
            </BaseView>
            {children}
        </BaseView>
    )
}

const Option = (props: PropsWithChildren<ViewProps>) => {
    return (
        <BaseView flexDirection="column" gap={16} {...props}>
            {props.children}
        </BaseView>
    )
}

SettingsSection.Option = Option

export { SettingsSection }
