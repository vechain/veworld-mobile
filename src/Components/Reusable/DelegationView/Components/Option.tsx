import { PropsWithChildren, default as React } from "react"
import { BaseText } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = PropsWithChildren<{
    label: string
}>

export const Option = ({ label, children }: Props) => {
    const theme = useTheme()
    return (
        <>
            <BaseText typographyFont="body" color={theme.colors.textLight}>
                {label}
            </BaseText>
            {children}
        </>
    )
}
