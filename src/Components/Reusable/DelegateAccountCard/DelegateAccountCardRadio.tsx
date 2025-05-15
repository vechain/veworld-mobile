import { ComponentProps, memo, default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon } from "~Components"
import { useThemedStyles } from "~Hooks"
import { DelegateAccountCard } from "./DelegateAccountCard"

type Props = Omit<ComponentProps<typeof DelegateAccountCard>, "children">

export const DelegateAccountCardRadio = memo(({ selected, ...props }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)

    const iconColor = useMemo(() => {
        if (selected) return theme.colors.radioButton.activeTextColor

        return theme.colors.radioButton.textColor
    }, [selected, theme.colors.radioButton.activeTextColor, theme.colors.radioButton.textColor])

    return (
        <DelegateAccountCard selected={selected} {...props}>
            <BaseIcon
                name={selected ? "icon-radio-selected" : "icon-radio-default"}
                color={iconColor}
                size={16}
                px={0}
                py={0}
                p={0}
                style={styles.icon}
            />
        </DelegateAccountCard>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 12,
        },
    })
