import React, { PropsWithChildren, useMemo } from "react"
import { ViewProps } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks/useTheme"
import { IconKey } from "~Model"

type Props = {
    icon: IconKey
    title: string
    children: React.ReactNode
}

const SettingsSection = ({ icon, title, children }: Props) => {
    const theme = useTheme()
    const textColor = useMemo(() => {
        return theme.isDark ? COLORS.WHITE : COLORS.PURPLE
    }, [theme])

    return (
        <BaseView flexDirection="column" gap={24}>
            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start" gap={12}>
                <BaseIcon name={icon} size={16} color={textColor} />
                <BaseText typographyFont="bodySemiBold" color={textColor}>
                    {title}
                </BaseText>
            </BaseView>
            {children}
        </BaseView>
    )
}

const Option = (props: PropsWithChildren<ViewProps>) => {
    return (
        <BaseView flexDirection="column" gap={8} {...props}>
            {props.children}
        </BaseView>
    )
}

SettingsSection.Option = Option

export { SettingsSection }
