import { Switch } from "react-native"
import React from "react"
import { BaseSpacer, BaseText } from "~Components"
import { LocalizedString } from "typesafe-i18n"
import { useTheme } from "~Common"

type Props = {
    title: LocalizedString
    subtitle: LocalizedString
    onValueChange: (value: boolean) => void
    value: boolean
}

export const EnableFeature = ({
    title,
    subtitle,
    onValueChange,
    value,
}: Props) => {
    const theme = useTheme()

    return (
        <>
            <BaseText typographyFont="bodyMedium">{title}</BaseText>
            <BaseText typographyFont="caption">{subtitle}</BaseText>
            <BaseSpacer height={20} />
            <Switch
                onValueChange={onValueChange}
                value={value}
                trackColor={{
                    false: theme.colors.disabled,
                    true: theme.colors.primary,
                }}
            />
        </>
    )
}
