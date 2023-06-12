import React, { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"

export type Step = {
    isActiveText: string
    isNextText: string
    isDoneText: string
    progressPercentage: number
    title: string
    subtitle: string
}
type Props = {
    steps: Step[]
    currentStep: number
    isCurrentStepError?: boolean
}

export const StepsProgressBar: React.FC<Props> = ({
    steps,
    currentStep,
    isCurrentStepError,
}) => {
    const theme = useTheme()

    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let percentage = 0
        const _currentStep = steps[currentStep]

        percentage = _currentStep?.progressPercentage || 100

        // Animated.timing(progress, {
        //     toValue: (currentStep + 1) * (100 / steps.length),
        //     duration: 300,
        //     useNativeDriver: false,
        // }).start()
        setProgress(percentage)
    }, [currentStep, steps.length, steps])

    const trackColor = theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.WHITE
    return (
        <BaseView bg={trackColor} w={100} h={2} mt={20} borderRadius={8}>
            <BaseView
                w={progress}
                flexDirection="row"
                h={100}
                bg={theme.colors.primary}
                borderRadius={8}
            />
            <BaseView
                style={styles.stepsContainer}
                w={100}
                flexDirection="row"
                justifyContent="space-around">
                {steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isNext = index === currentStep + 1
                    const isDone = index < currentStep
                    const isError = isCurrentStepError && isActive

                    const bgColor = isError
                        ? theme.colors.danger
                        : isNext
                        ? trackColor
                        : isActive
                        ? theme.colors.primary
                        : theme.colors.primary

                    const text = isNext
                        ? step.isNextText
                        : isActive
                        ? step.isActiveText
                        : isDone
                        ? step.isDoneText
                        : step.isActiveText

                    const icon = isError
                        ? "close"
                        : isDone
                        ? "check"
                        : isNext
                        ? "dots-horizontal"
                        : "circle"

                    return (
                        <BaseView
                            key={index}
                            justifyContent="flex-start"
                            alignItems="center">
                            {isActive && !isError ? (
                                <BaseView bg={bgColor} borderRadius={100} p={5}>
                                    <ActivityIndicator
                                        size={"small"}
                                        color={theme.colors.textReversed}
                                        style={{
                                            transform: [{ scale: 0.8 }],
                                        }}
                                    />
                                </BaseView>
                            ) : isNext ? (
                                <BaseView
                                    bg={bgColor}
                                    borderRadius={100}
                                    py={5}
                                    px={10}>
                                    <BaseText
                                        color={theme.colors.textReversed}
                                        typographyFont="bodyBold">
                                        {index + 1}
                                    </BaseText>
                                </BaseView>
                            ) : (
                                <BaseIcon
                                    bg={bgColor}
                                    name={icon}
                                    size={20}
                                    borderRadius={100}
                                />
                            )}

                            <BaseText
                                typographyFont={isNext ? "body" : "bodyBold"}
                                color={isNext ? theme.colors.text : bgColor}
                                pt={8}>
                                {text}
                            </BaseText>
                        </BaseView>
                    )
                })}
            </BaseView>
        </BaseView>
    )
}
const styles = StyleSheet.create({
    stepsContainer: {
        position: "absolute",
        bottom: "50%",
        transform: [{ translateY: 40 }],
        left: 0,
        right: 0,
    },
})
