import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { StyleSheet } from "react-native"
import React from "react"

export type EmptyResultsProps = {
    onClick: () => void
    title: string
    subtitle: string
    icon: string
}

export const EmptyResults = ({ onClick, title, subtitle, icon }: EmptyResultsProps) => {
    return (
        <BaseView mx={20} justifyContent="center" alignItems="center">
            <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                <BaseTouchable action={onClick}>
                    <BaseView
                        my={16}
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={styles.icon}>
                        <BaseIcon name={icon} size={45} />
                        <BaseText color={COLORS.DARK_PURPLE} typographyFont="bodyMedium">
                            {title}
                        </BaseText>
                    </BaseView>
                </BaseTouchable>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseText mx={20} typographyFont="body" align="center">
                {subtitle}
            </BaseText>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    icon: {
        width: 200,
        height: 100,
    },
})
