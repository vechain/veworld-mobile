import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    EntryAnimationsValues,
    ExitAnimationsValues,
    FadeInLeft,
    FadeOutLeft,
    LinearTransition,
} from "react-native-reanimated"
import { BaseButton, BaseView, Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { ReceiverScreen, SendContextProvider, SendFlowStep, useSendContext } from "~Components/Reusable/Send"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { useI18nContext } from "~i18n"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "./Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "./Animations/Exiting"

const ORDER: SendFlowStep[] = ["selectAmount", "insertAddress", "summary"]

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

const AnimatedBaseButton = Animated.createAnimatedComponent(wrapFunctionComponent(BaseButton))
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

export const SendScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()

    const navigation = useNavigation<NavigationProps>()
    const { styles } = useThemedStyles(baseStyles)
    const { step, previousStep, nextStep, goToNext, goToPrevious, isPreviousButtonEnabled, isNextButtonEnabled } =
        useSendContext()

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    const Entering = useCallback(
        (values: EntryAnimationsValues) => {
            "worklet"
            if (!previousStep.value || !nextStep.value)
                return {
                    initialValues: values,
                    animations: {},
                }
            if (ORDER.indexOf(nextStep.value) > ORDER.indexOf(previousStep.value))
                return EnteringFromRightAnimation(values)
            return EnteringFromLeftAnimation(values)
        },
        [nextStep.value, previousStep.value],
    )

    const Exiting = useCallback(
        (values: ExitAnimationsValues) => {
            "worklet"
            if (!previousStep.value || !nextStep.value)
                return {
                    initialValues: values,
                    animations: {},
                }
            if (ORDER.indexOf(nextStep.value) > ORDER.indexOf(previousStep.value)) return ExitingToLeftAnimation(values)
            return ExitingToRightAnimation(values)
        },
        [nextStep.value, previousStep.value],
    )

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={styles.flexElement}>
                    <Animated.View style={styles.flexElement} entering={Entering} exiting={Exiting} key={step}>
                        {step === "selectAmount" && <></>}
                        {step === "insertAddress" && <ReceiverScreen />}
                        {step === "summary" && <></>}
                    </Animated.View>
                </Animated.View>
            }
            footer={
                <AnimatedBaseView flexDirection="row" gap={16} layout={LinearTransition}>
                    {step !== "selectAmount" && (
                        <AnimatedBaseButton
                            variant="outline"
                            flex={1}
                            action={goToPrevious}
                            layout={LinearTransition}
                            disabled={!isPreviousButtonEnabled}
                            entering={FadeInLeft.delay(50)}
                            exiting={FadeOutLeft}>
                            {LL.COMMON_LBL_BACK()}
                        </AnimatedBaseButton>
                    )}
                    <AnimatedBaseButton
                        flex={1}
                        action={goToNext}
                        disabled={!isNextButtonEnabled}
                        layout={LinearTransition}>
                        {LL.COMMON_LBL_NEXT()}
                    </AnimatedBaseButton>
                </AnimatedBaseView>
            }
        />
    )
}

export const SendScreen = () => {
    return (
        <SendContextProvider>
            <SendScreenContent />
        </SendContextProvider>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        flexElement: { flex: 1 },
    })
