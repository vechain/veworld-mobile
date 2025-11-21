import React, { ComponentProps } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = Omit<ComponentProps<typeof BaseButton>, "variant" | "textColor" | "bgColor" | "rightIcon">

export const SeeAllButton = ({ style, children, ...props }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseButton
            variant="solid"
            px={12}
            py={8}
            typographyFont="captionSemiBold"
            style={[styles.btn, style]}
            textColor={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
            bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200}
            selfAlign="flex-start"
            rightIcon={
                <BaseIcon
                    name="icon-arrow-right"
                    size={16}
                    style={styles.icon}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                />
            }
            {...props}>
            {children}
        </BaseButton>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 8,
        },
        btn: {
            marginTop: 16,
        },
    })
