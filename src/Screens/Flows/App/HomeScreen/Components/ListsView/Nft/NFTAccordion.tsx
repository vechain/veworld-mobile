import React, { useCallback, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
    measure,
    runOnUI,
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { useTheme } from "~Common"
import { BaseIcon } from "~Components"

type Props = {
    headerComponent: React.ReactNode
    bodyComponent: React.ReactNode
}

export const NFTAccordion = ({ headerComponent, bodyComponent }: Props) => {
    const theme = useTheme()
    const aref = useAnimatedRef<View>()
    const open = useSharedValue(false)
    const height = useSharedValue(0)
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0),
    )

    const bodyContainerDynamicStyle = useAnimatedStyle(() => {
        return {
            height: height.value * progress.value + 0.1,
            opacity: progress.value === 0 ? 0 : 1,
        }
    })

    const dynamicStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${progress.value * 180}deg` }],
        }
    })

    const onChevronPress = useCallback(() => {
        if (height.value === 0) {
            runOnUI(() => {
                "worklet"

                height.value = measure(aref)!.height
            })()
        }
        open.value = !open.value
    }, [aref, height, open])

    const renderCollapseIcon = useMemo(() => {
        return (
            <Animated.View style={[dynamicStyle, styles.chevronIcon]}>
                <BaseIcon
                    name={"chevron-down"}
                    color={theme.colors.text}
                    size={36}
                    action={onChevronPress}
                />
            </Animated.View>
        )
    }, [dynamicStyle, onChevronPress, theme])

    return (
        <>
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    {headerComponent}
                    {renderCollapseIcon}
                </View>
            </View>
            <Animated.View
                style={[styles.bodyContainer, bodyContainerDynamicStyle]}>
                <View ref={aref} style={styles.bodyContent}>
                    {bodyComponent}
                </View>
            </Animated.View>
        </>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        width: "100%",
        flexDirection: "row",
    },
    headerContent: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bodyContainer: { width: "100%", overflow: "hidden" },
    bodyContent: { width: "100%" },
    chevronIcon: {
        marginRight: 20,
    },
})
