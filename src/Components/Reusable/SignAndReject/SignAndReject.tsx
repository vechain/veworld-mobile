import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BaseButton, BaseSpacer, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"

export type SignAndRejectRefInterface = {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

type Props = {
    onConfirmTitle: string
    onRejectTitle: string
    onConfirm: () => void
    onReject: () => void
    confirmButtonDisabled?: boolean
    isConfirmLoading?: boolean
    rejectButtonDisabled?: boolean
    isRejectLoading?: boolean
}

export const SignAndReject = React.forwardRef<SignAndRejectRefInterface, Props>(
    (
        {
            onConfirmTitle,
            onRejectTitle,
            onConfirm,
            onReject,
            confirmButtonDisabled = false,
            isConfirmLoading = false,
            rejectButtonDisabled = false,
            isRejectLoading = false,
        }: Props,
        ref,
    ) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const [isVisible, setIsVisible] = useState(true)
        const yOffset = useRef(0)

        const bottomInitialValue = -194
        const bottom = useSharedValue(bottomInitialValue)

        const animatedStyle = useAnimatedStyle(() => {
            return {
                bottom: bottom.value,
            }
        })

        useEffect(() => {
            let newValue = bottomInitialValue

            if (isVisible) {
                newValue = 0
            }

            bottom.value = withSpring(newValue, {
                mass: 1.2,
                damping: 22,
                stiffness: 190,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            })
        }, [bottom, bottomInitialValue, isVisible])

        const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
            e.persist()
            if (e.nativeEvent.contentOffset) {
                const offsetY = e.nativeEvent.contentOffset.y
                const contentHeight = e.nativeEvent.contentSize.height
                const scrollViewHeight = e.nativeEvent.layoutMeasurement.height
                const maxOffset = contentHeight > scrollViewHeight ? contentHeight - scrollViewHeight - 10 : 0
                const isAtBottom = offsetY > maxOffset
                const shouldShow = offsetY <= yOffset.current || offsetY <= 0 || isAtBottom
                setIsVisible(shouldShow)
                yOffset.current = offsetY
            }
        }, [])

        useImperativeHandle(
            ref,
            () => ({
                onScroll: onScroll,
            }),
            [onScroll],
        )

        return (
            <Animated.View style={[styles.buttonsContainer, animatedStyle]}>
                <LinearGradient
                    style={styles.gradientContainer}
                    colors={[theme.colors.backgroundTransparent, theme.colors.background]}>
                    <BaseView style={styles.rootContainer}>
                        <BaseButton
                            w={100}
                            haptics="Light"
                            title={onConfirmTitle}
                            action={onConfirm}
                            isLoading={isConfirmLoading}
                            disabled={confirmButtonDisabled}
                        />
                        <BaseSpacer height={16} />
                        <BaseButton
                            w={100}
                            haptics="Light"
                            variant="outline"
                            title={onRejectTitle}
                            action={onReject}
                            isLoading={isRejectLoading}
                            disabled={rejectButtonDisabled}
                            style={{ backgroundColor: theme.colors.background }}
                        />
                    </BaseView>
                </LinearGradient>
            </Animated.View>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            height: 194,
            width: "100%",
            padding: 16,
            alignItems: "center",
        },
        buttonsContainer: {
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 194,
            width: "100%",
        },
        gradientContainer: {
            width: "100%",
        },
    })
