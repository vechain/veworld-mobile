import React, { useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { FadeIn, FadeOut, ZoomInEasyUp, ZoomOutEasyUp } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BaseIcon } from "~Components/Base"
import { BaseText } from "~Components/Base/BaseText"
import { Spinner } from "~Components/Reusable/Spinner"
import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FeedbackSeverity, FeedbackShowArgs, FeedbackType } from "../Model"

type Props = {
    show: boolean
    feedbackData: FeedbackShowArgs | null
    onDismiss: () => void
}

export const FeedbackChip = ({ show, feedbackData, onDismiss }: Props) => {
    const inset = useSafeAreaInsets()
    const { styles, theme } = useThemedStyles(baseStyle({ top: inset.top + 8 }))

    const icon = useMemo(() => {
        if (!feedbackData) return "icon-info"
        if (feedbackData.icon) return feedbackData.icon

        switch (feedbackData.severity) {
            case FeedbackSeverity.SUCCESS:
                return "icon-check-circle-2"
            case FeedbackSeverity.WARNING:
                return "icon-alert-triangle"
            case FeedbackSeverity.ERROR:
                return "icon-alert-circle"
            case FeedbackSeverity.INFO:
            default:
                return "icon-info"
        }
    }, [feedbackData])

    return show && feedbackData ? (
        <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
            <Animated.View testID="FEEDBACK_CHIP" entering={ZoomInEasyUp} exiting={ZoomOutEasyUp} style={[styles.chip]}>
                <Animated.View style={styles.innerContainer}>
                    {feedbackData.severity !== FeedbackSeverity.LOADING ? (
                        <BaseIcon
                            testID="FEEDBACK_CHIP_ICON"
                            name={icon}
                            size={16}
                            color={theme.colors.feedbackChip.icon[feedbackData.severity]}
                        />
                    ) : (
                        <Spinner size={16} color={theme.colors.feedbackChip.icon[feedbackData.severity]} />
                    )}
                    <BaseText
                        testID="FEEDBACK_CHIP_MESSAGE"
                        typographyFont="bodySemiBold"
                        color={theme.colors.feedbackChip.text}>
                        {feedbackData.message}
                    </BaseText>
                    {feedbackData.type === FeedbackType.PERMANENT && (
                        <TouchableOpacity onPress={onDismiss}>
                            <BaseIcon
                                testID="FEEDBACK_CHIP_CLOSE_BUTTON"
                                name="icon-x"
                                size={16}
                                borderRadius={20}
                                color={theme.colors.feedbackChip.closeButton}
                            />
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    ) : null
}

const baseStyle =
    ({ top }: { top: number }) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            container: {
                zIndex: 99,
                position: "absolute",
                top: top,
                left: 0,
                width: SCREEN_WIDTH,
                height: 36,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "box-none",
            },
            chip: {
                zIndex: 1,
                flexGrow: 0,
                maxWidth: SCREEN_WIDTH * 0.65,
                borderRadius: 20,
                backgroundColor: theme.colors.feedbackChip.background,
                transformOrigin: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
            },
            innerContainer: {
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
            },
        })
