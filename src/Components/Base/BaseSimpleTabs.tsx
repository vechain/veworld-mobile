import React, { useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseText } from "./BaseText"
import { BaseView } from "./BaseView"

type Props<TKeys extends string[] | readonly string[]> = {
    keys: TKeys
    labels: string[]
    selectedKey: TKeys[number]
    rightIcon?: React.ReactNode
    setSelectedKey: (key: TKeys[number]) => void
    rootStyle?: StyleProp<ViewStyle>
}

export const BaseSimpleTabs = <TKeys extends string[] | readonly string[]>({
    keys,
    labels,
    selectedKey,
    rightIcon,
    setSelectedKey,
    rootStyle,
}: Props<TKeys>) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [tabOffsets, setTabOffsets] = useState<{ offsetX: number; width: number }[]>([])
    const selectedIndex = useMemo(() => keys.indexOf(selectedKey), [keys, selectedKey])
    const getTextColor = useCallback(
        (isSelected: boolean) => {
            if (isSelected) return theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
            return theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500
        },
        [theme.isDark],
    )
    const onLayout = useCallback(
        (index: number) => (e: LayoutChangeEvent) => {
            setTabOffsets(old => {
                const copy = [...old]
                copy[index] = { offsetX: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width }
                return copy
            })
        },
        [],
    )
    const indicatorStyles = useAnimatedStyle(() => {
        const offset = tabOffsets[selectedIndex]
        if (!offset) return { width: withTiming(100), left: withTiming(0) }
        return {
            width: withTiming(offset.width),
            left: withTiming(offset.offsetX),
        }
    }, [tabOffsets, selectedIndex, keys.length])
    if (keys.length !== labels.length) throw new Error("Keys and Labels should have the same length")
    return (
        <BaseView style={[styles.root, rootStyle]} flexDirection="row" justifyContent="space-between">
            <BaseView flexDirection="row" flex={1} gap={8} overflow="scroll">
                {keys.map((key, index) => {
                    const isSelected = selectedKey === key
                    const textColor = getTextColor(isSelected)
                    return (
                        <TouchableOpacity
                            key={key}
                            style={styles.tab}
                            onPress={() => setSelectedKey(key)}
                            onLayout={e => {
                                e.persist()
                                onLayout(index)(e)
                            }}>
                            <BaseText color={textColor} typographyFont="subSubTitleSemiBold">
                                {labels[index]}
                            </BaseText>
                        </TouchableOpacity>
                    )
                })}
                <Animated.View style={[indicatorStyles, styles.indicator]} />
            </BaseView>

            {rightIcon}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: COLORS.TRANSPARENT,
            position: "relative",
            gap: 8,
        },
        tab: {
            padding: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        indicator: {
            backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            pointerEvents: "none",
            position: "absolute",
            height: 2,
            zIndex: -1,
            bottom: 0,
            borderRadius: 0,
        },
    })
