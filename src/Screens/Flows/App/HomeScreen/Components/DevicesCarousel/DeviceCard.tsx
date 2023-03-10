import React, { memo } from "react"
import { StyleProp, ViewStyle, ViewProps, StyleSheet } from "react-native"
import type { AnimateProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Device } from "~Storage"

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    device: Device
}

export const DeviceCard: React.FC<Props> = memo(props => {
    const { style, device, ...animatedViewProps } = props
    const { styles, theme } = useThemedStyles(baseStyles)

    const { LL } = useI18nContext()

    return (
        <Animated.View style={styles.container} {...animatedViewProps}>
            <BaseView
                bg={theme.colors.primary}
                flex={1}
                justifyContent="center"
                alignItems="center"
                borderRadius={24}
                px={16}
                py={16}
                style={style}>
                <BaseText color={theme.colors.tertiary}>
                    {LL.SB_DEVICE_CARD({
                        alias: device.alias,
                        accounts: device.accounts.length,
                    })}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        itemContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            borderRadius: 24,
        },
    })
