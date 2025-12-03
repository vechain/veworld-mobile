import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    EntryAnimationsValues,
    ExitAnimationsValues,
    FadeInLeft,
    FadeOutLeft,
    LinearTransition,
} from "react-native-reanimated"

import { SummaryScreen } from "~Components/Reusable/Send"
import { BaseButton, BaseView, Layout, SendContextProvider, SendFlowStep, useSendContext } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "./Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "./Animations/Exiting"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

const ORDER: SendFlowStep[] = ["selectAmount", "insertAddress", "summary"]

const AnimatedBaseButton = Animated.createAnimatedComponent(wrapFunctionComponent(BaseButton))
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

export const SendScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const { styles } = useThemedStyles(baseStyles)

    const {
        step,
        flowState,
        previousStep,
        nextStep,
        goToNext,
        goToPrevious,
        isPreviousButtonEnabled,
        isNextButtonEnabled,
    } = useSendContext()

    const [txError, setTxError] = useState(false)
    const [txControls, setTxControls] = useState<{
        onSubmit: () => void
        isDisabledButtonState: boolean
    } | null>(null)

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    const handleTxFinished = useCallback(
        (success: boolean) => {
            if (success) {
                navigation.navigate(Routes.HOME)
                return
            }
            setTxError(true)
        },
        [navigation],
    )

    const handleConfirmPress = useCallback(() => {
        if (!txControls) return
        setTxError(false)
        txControls.onSubmit()
    }, [txControls])

    const renderStep = useMemo(() => {
        if (step !== "summary") {
            // TODO(send-flow-v2): Implement select amount and insert address steps
            return <BaseView flex={1} />
        }

        const { token, amount, address, initialExchangeRate } = flowState

        if (!token || !amount || !address) {
            // TODO(send-flow-v2): add an error screen
            return <BaseView flex={1} />
        }

        return (
            <SummaryScreen
                token={token}
                amount={amount}
                address={address}
                initialExchangeRate={initialExchangeRate ?? null}
                onTxFinished={handleTxFinished}
                onBindTransactionControls={setTxControls}
                txError={txError}
            />
        )
    }, [step, flowState, handleTxFinished, txError])

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

    const isSummaryStep = step === "summary"

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={styles.flexElement}>
                    <Animated.View style={styles.flexElement} entering={Entering} exiting={Exiting} key={step}>
                        {renderStep}
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
                        action={isSummaryStep ? handleConfirmPress : goToNext}
                        disabled={
                            isSummaryStep ? !txControls || txControls.isDisabledButtonState : !isNextButtonEnabled
                        }
                        layout={LinearTransition}>
                        {isSummaryStep
                            ? txError
                                ? LL.COMMON_BTN_TRY_AGAIN()
                                : LL.COMMON_BTN_CONFIRM()
                            : LL.COMMON_LBL_NEXT()}
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
