import React from "react"
import { BaseSpacer, BaseSwitch, BaseText } from "~Components"

type Props = {
    title: string
    subtitle?: string
    onValueChange: (value: boolean) => void
    value: boolean
}

export const EnableFeature = ({
    title,
    subtitle,
    onValueChange,
    value,
}: Props) => {
    return (
        <>
            <BaseText typographyFont="bodyMedium" my={8}>
                {title}
            </BaseText>
            {subtitle && (
                <BaseText typographyFont="caption">{subtitle}</BaseText>
            )}
            <BaseSpacer height={20} />
            <BaseSwitch onValueChange={onValueChange} value={value} />
        </>
    )
}
