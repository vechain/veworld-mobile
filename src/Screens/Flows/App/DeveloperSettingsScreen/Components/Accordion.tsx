import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseIconProps, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components"
import { COLORS } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { ReanimatedUtils } from "~Utils"

const AccordionContext = createContext<{ open: boolean; setOpen: (newValue: boolean) => void }>({
    open: false,
    setOpen: () => {},
})

export const useAccordion = () => useContext(AccordionContext)

type AccordionProps = BaseViewProps

const Accordion = ({ children, ...props }: PropsWithChildren<AccordionProps>) => {
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const ctxProps = useMemo(() => ({ open, setOpen }), [open, setOpen])

    return (
        <AccordionContext.Provider value={ctxProps}>
            <BaseView flexDirection="column" bg={theme.colors.card} borderRadius={8} {...props}>
                {children}
            </BaseView>
        </AccordionContext.Provider>
    )
}

type AccordionContentProps = PropsWithChildren<{
    style?: StyleProp<ViewStyle>
}>

const AccordionContent = ({ style, children }: AccordionContentProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const height = useSharedValue(0)
    const { open } = useContext(AccordionContext)

    const derivedHeight = useDerivedValue(
        () =>
            withTiming(height.value * Number(open), {
                duration: 500,
            }),
        [height.value, open],
    )

    const bodyStyle = useAnimatedStyle(
        () => ({
            height: derivedHeight.value,
        }),
        [derivedHeight.value],
    )

    return (
        <Animated.View style={[styles.root, bodyStyle, style]}>
            <View
                onLayout={e => {
                    height.value = e.nativeEvent.layout.height
                }}
                style={styles.wrapper}>
                {children}
            </View>
        </Animated.View>
    )
}

const AccordionContentDescription = ({ children, ...props }: BaseTextProps) => {
    const theme = useTheme()

    return (
        <BaseText typographyFont="caption" color={theme.colors.editSpeedBs.subtitle} pb={8} {...props}>
            {children}
        </BaseText>
    )
}

type AccordionHeaderProps = PropsWithChildren<{
    style?: StyleProp<ViewStyle>
}>

const AnimatedBaseIcon = Animated.createAnimatedComponent(ReanimatedUtils.wrapFunctionComponent(BaseIcon))

const AccordionHeader = ({ style, children }: AccordionHeaderProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { open, setOpen } = useAccordion()

    const onPress = useCallback(() => {
        setOpen(!open)
    }, [open, setOpen])

    return (
        <Pressable style={[styles.header, style]} onPress={onPress}>
            {children}
        </Pressable>
    )
}

const AccordionHeaderIcon = ({ style, ...props }: Omit<BaseIconProps, "name">) => {
    const { open } = useContext(AccordionContext)

    const derivedRotation = useDerivedValue(() =>
        withTiming(180 * Number(open), {
            duration: 500,
        }),
    )
    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${derivedRotation.value}deg` }],
    }))
    return (
        <AnimatedBaseIcon
            name="icon-chevron-down"
            size={16}
            color={COLORS.WHITE}
            style={[iconStyle, style]}
            {...props}
        />
    )
}

const AccordionHeaderText = ({ children, ...props }: BaseTextProps) => {
    return (
        <BaseText typographyFont="button" {...props}>
            {children}
        </BaseText>
    )
}

Accordion.Header = AccordionHeader
Accordion.Content = AccordionContent
Accordion.ContentDescription = AccordionContentDescription
Accordion.HeaderIcon = AccordionHeaderIcon
Accordion.HeaderText = AccordionHeaderText

export { Accordion }

const baseStyles = () =>
    StyleSheet.create({
        wrapper: {
            width: "100%",
            position: "absolute",
            display: "flex",
            alignItems: "stretch",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
        },
        root: {
            overflow: "hidden",
            width: "100%",
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
        },
    })
