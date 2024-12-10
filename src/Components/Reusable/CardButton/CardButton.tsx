import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { IconKey } from "~Model"

type Props = {
    leftIcon?: IconKey
    rightIcon?: IconKey
    title: string
    action?: () => void
}
export const CardButton = ({ leftIcon, rightIcon, title, action }: Props) => {
    const theme = useTheme()

    const renderLeftIcon = useMemo(() => {
        if (!leftIcon) return null
        return <BaseIcon name={leftIcon} size={24} color={theme.colors.primary} />
    }, [leftIcon, theme.colors.primary])

    const renderRightIcon = useMemo(() => {
        if (!rightIcon) return null
        return <BaseIcon name={rightIcon} size={24} color={theme.colors.primary} />
    }, [rightIcon, theme.colors.primary])

    return (
        <BaseCard onPress={action} style={styles.cardButton}>
            <BaseView flexDirection="row">
                {renderLeftIcon}
                {leftIcon && <BaseSpacer width={8} />}
                <BaseText typographyFont="subSubTitle">{title}</BaseText>
            </BaseView>
            {renderRightIcon}
        </BaseCard>
    )
}

const styles = StyleSheet.create({
    cardButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
    },
})
