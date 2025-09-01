import React, { useCallback, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet, TouchableOpacity } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseText } from "./BaseText"
import { BaseView } from "./BaseView"

type Props<TKeys extends string[] | readonly string[]> = {
    keys: TKeys
    labels: string[]
    selectedKey: TKeys[number]
    setSelectedKey: (key: TKeys[number]) => void
}

export const BaseTabs = <TKeys extends string[] | readonly string[]>({
    keys,
    labels,
    selectedKey,
    setSelectedKey,
}: Props<TKeys>) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [tabOffsets, setTabOffsets] = useState<{ offsetX: number; width: number }[]>([])
    const selectedIndex = useMemo(() => keys.indexOf(selectedKey), [keys, selectedKey])
    const getTextColor = useCallback(
        (isSelected: boolean) => {
            if (isSelected) return theme.isDark ? COLORS.WHITE : COLORS.GREY_700
            return theme.isDark ? COLORS.WHITE : COLORS.GREY_600
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
        return { width: withTiming(offset.width), left: withTiming(offset.offsetX) }
    }, [tabOffsets, selectedIndex, keys.length])
    if (keys.length !== labels.length) throw new Error("Keys and Labels should have the same length")
    return (
        <BaseView style={styles.root} flexDirection="row" gap={4}>
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
                        <BaseText color={textColor} typographyFont="bodyMedium">
                            {labels[index]}
                        </BaseText>
                    </TouchableOpacity>
                )
            })}
            <Animated.View style={[indicatorStyles, styles.indicator]} />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
            padding: 4,
            position: "relative",
            borderRadius: 8,
        },
        tab: {
            flex: 1,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        indicator: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100,
            pointerEvents: "none",
            borderRadius: 4,
            position: "absolute",
            marginVertical: 4,
            top: 0,
            height: "100%",
            zIndex: -1,
        },
    })
