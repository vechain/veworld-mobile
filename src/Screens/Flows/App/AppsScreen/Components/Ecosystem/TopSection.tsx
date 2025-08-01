import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    onPress: () => void
}

export const TopSection = ({ onPress }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseView flexDirection={"row"} justifyContent="space-between">
            <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_ECOSYSTEM()}</BaseText>
            <BaseTouchable onPress={onPress} style={styles.button}>
                <BaseIcon name="icon-sort-desc" size={20} color={theme.colors.text} />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        button: {
            padding: 10,
        },
    })
