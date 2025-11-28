import React, { useEffect } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, {
    AnimatedStyle,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { DEVICE_TYPE } from "~Model"
import AddressUtils from "~Utils/AddressUtils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { AccountIcon } from "../Account/AccountIcon"

type Props = {
    accountName?: string
    accountAddress: string
    onPress: ({ accountName, accountAddress }: { accountName?: string; accountAddress: string }) => void
    testID?: string
    containerStyle?: StyleProp<AnimatedStyle<ViewStyle>>
    disabled?: boolean
    selected?: boolean
}

const AnimatedTouchable = Animated.createAnimatedComponent(wrapFunctionComponent(BaseTouchable))
const AnimatedIcon = Animated.createAnimatedComponent(wrapFunctionComponent(BaseIcon))

export const GenericAccountCard = ({
    accountName,
    accountAddress,
    onPress,
    testID,
    containerStyle,
    disabled,
    selected = false,
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const selectedSV = useSharedValue(Number(selected))
    const { name: vnsName } = useVns({ name: "", address: accountAddress })

    const containerAnimatedStyles = useAnimatedStyle(() => {
        return {
            borderWidth: withTiming(selectedSV.value ? 2 : 1, { duration: 300 }),
            borderColor: interpolateColor(
                selectedSV.value,
                [0, 1],
                [
                    theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
                    theme.isDark ? COLORS.LIME_GREEN : COLORS.PRIMARY_800,
                ],
            ),
            paddingVertical: withTiming(selectedSV.value ? 20 : 12, { duration: 300 }),
        }
    })

    const iconAnimatedStyles = useAnimatedStyle(() => {
        return {
            opacity: withTiming(selectedSV.value ? 1 : 0, { duration: 300 }),
            transform: [
                {
                    scale: withTiming(selectedSV.value ? 1 : 0, { duration: 300 }),
                },
            ],
        }
    })

    useEffect(() => {
        selectedSV.value = Number(selected)
    }, [selected, selectedSV])

    return (
        <AnimatedTouchable
            testID={testID}
            disabled={disabled}
            onPress={() => onPress({ accountName, accountAddress })}
            style={[styles.container, containerAnimatedStyles, containerStyle]}>
            <BaseView flexDirection="row" flex={1} gap={12} justifyContent="space-between" alignItems="center">
                <AccountIcon account={{ address: accountAddress, type: DEVICE_TYPE.LOCAL_MNEMONIC }} size={32} />
                <BaseView flex={1} flexDirection="column">
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                        {vnsName || accountName || AddressUtils.humanAddress(accountAddress)}
                    </BaseText>
                    {(vnsName || accountName) && (
                        <BaseText
                            typographyFont="smallCaptionMedium"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                            {AddressUtils.humanAddress(accountAddress)}
                        </BaseText>
                    )}
                </BaseView>

                {selected && (
                    <AnimatedIcon
                        name="icon-radio-selected"
                        color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                        size={16}
                        style={iconAnimatedStyles}
                    />
                )}
            </BaseView>
        </AnimatedTouchable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            flex: 1,
            padding: 12,
            gap: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            transformOrigin: "center",
        },
    })
