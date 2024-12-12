import React, { useEffect, useRef } from "react"
import { useWindowDimensions } from "react-native"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BaseSearchInput, BaseView, Icon } from "~Components"
import { IconKey } from "~Model"

type AnimatedSearchBarProps = {
    placeholder: string
    value: string
    iconName: IconKey
    iconColor: string
    onTextChange: (text: string) => void
    onIconPress?: () => void
}

export const AnimatedSearchBar = ({
    placeholder,
    value,
    iconName,
    iconColor,
    onTextChange,
    onIconPress,
}: AnimatedSearchBarProps) => {
    const { width: windowWidth } = useWindowDimensions()

    const dimensions = useRef(
        (() => {
            const paddingRight = iconName ? 12 : 0
            const iconSize = 32
            const totalIconContainerSize = paddingRight + iconSize
            const fullWidthPercentage = 100
            const iconContainerWidthPercentage = iconName
                ? (totalIconContainerSize / windowWidth) * fullWidthPercentage
                : 0
            const initialInputContainerWidthPercentage = fullWidthPercentage - iconContainerWidthPercentage

            return {
                paddingRight,
                iconSize,
                initialInputContainerWidthPercentage,
                fullWidthPercentage,
            }
        })(),
    )

    const inputContainerWidth = useSharedValue(dimensions.current.initialInputContainerWidthPercentage)

    const animatedInputStyle = useAnimatedStyle(() => {
        return {
            width: `${inputContainerWidth.value}%`,
        }
    }, [inputContainerWidth])

    useEffect(() => {
        const targetValue =
            value.length > 0
                ? dimensions.current.fullWidthPercentage
                : dimensions.current.initialInputContainerWidthPercentage

        inputContainerWidth.value = withSpring(targetValue, {
            mass: 1.2,
            damping: 22,
            stiffness: 190,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        })
    }, [inputContainerWidth, value.length])

    return (
        <BaseView flexDirection="row" alignItems="center">
            <Animated.View style={[animatedInputStyle, { paddingRight: dimensions.current.paddingRight }]}>
                <BaseSearchInput
                    placeholder={placeholder}
                    setValue={onTextChange}
                    value={value}
                    showIcon={value.length > 0}
                    iconName="icon-x"
                    iconSize={18}
                    onIconPress={() => onTextChange("")}
                />
            </Animated.View>
            {iconName && onIconPress && (
                <BaseView justifyContent={"center"} alignItems={"center"}>
                    <Icon name={iconName} size={dimensions.current.iconSize} color={iconColor} onPress={onIconPress} />
                </BaseView>
            )}
        </BaseView>
    )
}
