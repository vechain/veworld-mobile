import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback } from "react"
import { LayoutChangeEvent, StyleSheet, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { clamp, interpolate, SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { AccountIcon, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type Props = {
    scrollY: SharedValue<number>
    contentOffsetY: SharedValue<number>
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export const Header = ({ scrollY, contentOffsetY }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const account = useAppSelector(selectSelectedAccount)

    const nav = useNavigation()

    const height = useSharedValue(90)

    const onWalletManagementPress = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const gradientStyle = useAnimatedStyle(() => {
        return {
            height: height.value * 2,
            transform: [
                {
                    translateY: -clamp(
                        interpolate(scrollY.value, [0, contentOffsetY.value - height.value], [0, height.value * 0.58]),
                        0,
                        height.value,
                    ),
                },
            ],
        }
    }, [scrollY.value, contentOffsetY.value])

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            height.value = e.nativeEvent.layout.height
        },
        [height],
    )

    return (
        <BaseView style={styles.root} onLayout={onLayout}>
            <AnimatedLinearGradient
                colors={[COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.50)", "#423483"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.65, 1]}
                angle={0}
                style={[gradientStyle, styles.gradient]}
            />
            <TouchableOpacity>
                <BaseView flexDirection="row" gap={12} p={8} pr={16} borderRadius={99} bg="rgba(255, 255, 255, 0.05)">
                    <AccountIcon address={account.address} size={24} borderRadius={100} />
                    <BaseText typographyFont="captionSemiBold" color={COLORS.PURPLE_LABEL}>
                        {account.alias}
                    </BaseText>
                </BaseView>
            </TouchableOpacity>

            <BaseView flexDirection="row" gap={12}>
                <TouchableOpacity onPress={onWalletManagementPress}>
                    <BaseView borderRadius={99} p={10} bg="rgba(255, 255, 255, 0.05)">
                        <BaseIcon name="icon-wallet" color={COLORS.PURPLE_LABEL} size={20} />
                    </BaseView>
                </TouchableOpacity>
                <TouchableOpacity>
                    <BaseView borderRadius={99} p={10} bg="rgba(255, 255, 255, 0.05)">
                        <BaseIcon name="icon-scanQR" color={COLORS.PURPLE_LABEL} size={20} />
                    </BaseView>
                </TouchableOpacity>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: "row",
            paddingTop: 8,
            paddingHorizontal: 16,
            paddingBottom: 16,
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
        },
        gradient: {
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "bottom",
            width: SCREEN_WIDTH,
            zIndex: -1,
        },
    })
