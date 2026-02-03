import React, { useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, {
    interpolateColor,
    LinearTransition,
    useAnimatedStyle,
    withTiming,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks/useTheme"
import { ConnectedLedgerDevice } from "~Model"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

type Props = {
    device: ConnectedLedgerDevice
    onPress: () => void
    isSelected?: boolean
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)
const AnimatedBaseText = Animated.createAnimatedComponent(wrapFunctionComponent(BaseText))

export const LedgerDeviceBox: React.FC<Props> = ({ device, onPress, isSelected }) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    const containerAnimatedStyles = useAnimatedStyle(() => {
        const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        const unselectedColor = theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_200
        return {
            borderColor: interpolateColor(isSelected ? 1 : 0, [0, 1], [unselectedColor, selectedColor]),
            borderWidth: withTiming(isSelected ? 2 : 1, { duration: 250 }),
        }
    }, [isSelected, theme.isDark])

    const textColor = useMemo(() => {
        const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        const unselectedColor = theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
        return interpolateColor(isSelected ? 1 : 0, [0, 1], [unselectedColor, selectedColor])
    }, [isSelected, theme.isDark])

    return (
        <AnimatedTouchableOpacity
            testID={`LEDGER_DEVICE_BOX_${device.id}`}
            onPress={onPress}
            style={[themedStyles.root, containerAnimatedStyles]}
            layout={LinearTransition}>
            <BaseView gap={8}>
                <AnimatedBaseText typographyFont="bodySemiBold" color={textColor}>
                    {device.localName}
                </AnimatedBaseText>
                <BaseText typographyFont="captionRegular" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                    {device.id}
                </BaseText>
            </BaseView>
            {isSelected && (
                <Animated.View
                    testID={`LEDGER_DEVICE_BOX_SELECTED_ICON_${device.id}`}
                    entering={ZoomIn}
                    exiting={ZoomOut}
                    layout={LinearTransition}>
                    <BaseIcon name="icon-check" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} size={20} />
                </Animated.View>
            )}
        </AnimatedTouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            padding: 16,
            borderRadius: 12,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_200,
        },
    })
