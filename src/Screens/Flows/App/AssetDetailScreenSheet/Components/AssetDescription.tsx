import React, { useCallback, useMemo, useState } from "react"
import { GestureResponderEvent, NativeSyntheticEvent, Pressable, StyleSheet, TextLayoutEventData } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import HapticsService from "~Services/HapticsService"

type Props = {
    description: string | undefined
}

const DESCRIPTION_LINE_THRESHOLD = 3

export const AssetDescription = ({ description }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [isAccordionOpen, setIsAccordionOpen] = useState(false)
    const [descriptionLineCount, setDescriptionLineCount] = useState(0)
    const shouldShowAccordion = useMemo(() => {
        return descriptionLineCount > DESCRIPTION_LINE_THRESHOLD
    }, [descriptionLineCount])
    const open = useSharedValue(false)
    const progress = useDerivedValue(() => (open.value ? withTiming(1) : withTiming(0)))

    const chevronStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${progress.value * 180}deg` }],
        }
    }, [])
    const handleToggle = useCallback(() => {
        setIsAccordionOpen(prev => !prev)
        open.value = !open.value
        HapticsService.triggerHaptics({ haptics: "Light" })
    }, [open])
    /**
     * Measures the actual rendered line count of the description text.
     * Uses state guard (prev === lineCount) to prevent infinite re-render loop.
     */
    const handleTextLayout = useCallback((e: NativeSyntheticEvent<TextLayoutEventData>) => {
        const lineCount = e.nativeEvent.lines.length
        setDescriptionLineCount(prev => (prev === lineCount ? prev : lineCount))
    }, [])

    const handleResponder = useCallback(() => true, [])

    const handleTouchEnd = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation()
    }, [])

    if (!description) return null
    return (
        <>
            <BaseView flexDirection="row" alignItems="center" gap={12} justifyContent="flex-start" mb={12}>
                <BaseIcon name="icon-alert-circle" size={20} color={theme.colors.actionBanner.title} />
                <BaseText typographyFont="bodySemiBold" color={theme.colors.actionBanner.title}>
                    {LL.TITLE_ABOUT()}
                </BaseText>
            </BaseView>

            {/**
             * Hidden text element that measures the full untruncated line count.
             * This is necessary because onTextLayout with numberOfLines returns the truncated count,
             * not the true line count. The opacity:0 and absolute positioning ensure it doesn't
             * affect layout while still being measured by the layout engine.
             */}
            <BaseText
                typographyFont="smallButtonPrimary"
                color={theme.colors.textLightish}
                onTextLayout={handleTextLayout}
                style={styles.hiddenText}
                testID="token-description-hidden">
                {description}
            </BaseText>

            <BaseText
                typographyFont="smallButtonPrimary"
                color={theme.colors.textLightish}
                numberOfLines={shouldShowAccordion && !isAccordionOpen ? 3 : undefined}
                testID="token-description">
                {description}
            </BaseText>

            {shouldShowAccordion && (
                <BaseView my={12} onStartShouldSetResponder={handleResponder} onTouchEnd={handleTouchEnd}>
                    <Pressable onPress={handleToggle} style={styles.toggleButton} testID="read-more-toggle">
                        <BaseText typographyFont="smallButtonPrimary" color={theme.colors.actionBanner.title}>
                            {isAccordionOpen ? LL.COMMON_LBL_READ_LESS() : LL.COMMON_LBL_READ_MORE()}
                        </BaseText>
                        <Animated.View style={chevronStyle}>
                            <BaseIcon
                                name="icon-chevron-down"
                                color={theme.colors.actionBanner.title}
                                size={14}
                                testID="chevron"
                            />
                        </Animated.View>
                    </Pressable>
                </BaseView>
            )}
            <BaseSpacer height={8} />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        toggleButton: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 8,
            gap: 4,
            width: "100%",
        },
        hiddenText: {
            position: "absolute",
            opacity: 0,
            zIndex: -1,
        },
    })
