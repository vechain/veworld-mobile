import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import Animated, { EntryAnimationsValues, ExitAnimationsValues, useSharedValue } from "react-native-reanimated"

import { SummaryScreen } from "~Components/Reusable/Send"
import { StyleSheet } from "react-native"
import { BaseButton, BaseView, Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "./Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "./Animations/Exiting"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

type SendFlowStep = "insertAddress" | "selectAmount" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
    /**
     * Exchange rate used when the user selected the amount.
     * This is passed down to the summary step to detect subsequent market moves.
     */
    initialExchangeRate?: number | null
}

type FooterButtonConfig = {
    label: string
    onPress: () => void
    variant?: "outline" | "solid" | "link" | "ghost"
    disabled?: boolean
}

type FooterConfig = {
    left?: FooterButtonConfig
    right?: FooterButtonConfig
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

const AnimatedBaseButton = Animated.createAnimatedComponent(wrapFunctionComponent(BaseButton))
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

export const SendScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const [step, setStep] = useState<SendFlowStep>("insertAddress")
    const [flowState, setFlowState] = useState<SendFlowState>({})

    const [txError, setTxError] = useState(false)
    const [txControls, setTxControls] = useState<{
        onSubmit: () => void
        isDisabledButtonState: boolean
    } | null>(null)

    const { styles } = useThemedStyles(baseStyles)
    const { step, previousStep, nextStep, goToNext, goToPrevious, isPreviousButtonEnabled, isNextButtonEnabled } =
        useSendContext()

    const previousStep = useSharedValue<typeof step | undefined>(undefined)
    const nextStep = useSharedValue<typeof step | undefined>(undefined)

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    const goToInsertAddress = useCallback((token: FungibleTokenWithBalance) => {
        setFlowState(current => ({
            ...current,
            token,
            // reset downstream state when token changes
            address: undefined,
            amount: undefined,
        }))
        setStep("insertAddress")
    }, [])

    const goToSelectAmount = useCallback((address: string) => {
        setFlowState(current => ({
            ...current,
            address,
            // reset amount whenever address changes
            amount: undefined,
        }))
        setStep("selectAmount")
    }, [])

    const goToSummary = useCallback((amount: string, initialExchangeRate: number | null) => {
        setFlowState(current => ({
            ...current,
            amount,
            initialExchangeRate,
        }))
        setStep("summary")
    }, [])

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

    const goToPrev = useCallback(() => {
        switch (step) {
            case "selectAmount":
                nextStep.value = "insertAddress"
                previousStep.value = step
                setStep("insertAddress")
                break
            case "summary":
                nextStep.value = "selectAmount"
                previousStep.value = step
                setStep("selectAmount")
        }
    }, [nextStep, previousStep, step])

    const goToNext = useCallback(() => {
        switch (step) {
            case "insertAddress":
                nextStep.value = "selectAmount"
                previousStep.value = step
                setStep("selectAmount")
                break
            case "selectAmount":
                nextStep.value = "summary"
                previousStep.value = step
                setStep("summary")
        }
    }, [nextStep, previousStep, step])

    const renderStep = useMemo(() => {
        switch (step) {
            case "selectAmount":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement select amount step */}</BaseView>
            case "insertAddress":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement insert address step */}</BaseView>
            case "summary": {
                const { token, amount, address, initialExchangeRate } = flowState

                if (!token || !amount || !address) {
                    // TODO: add a Error Screen?!?!
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
            }
            default:
                return <BaseView flex={1} />
        }
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

    const footerConfig: FooterConfig = useMemo(() => {
        switch (step) {
            case "selectAmount":
                return {
                    right: {
                        label: LL.COMMON_BTN_NEXT(),
                        onPress: () => {
                            if (flowState.token) {
                                goToInsertAddress(flowState.token)
                            }
                        },
                        disabled: !flowState.token,
                    },
                }
            case "insertAddress":
                return {
                    left: {
                        label: LL.COMMON_BTN_BACK(),
                        onPress: goToPrev,
                        variant: "outline",
                    },
                    right: {
                        label: LL.COMMON_BTN_NEXT(),
                        onPress: () => {
                            if (flowState.amount) {
                                // TODO(send-flow-v2): once select amount step is implemented,
                                // capture the exchange rate used to price the entered amount and pass it here.
                                goToSummary(flowState.amount, null)
                            }
                        },
                        disabled: !flowState.amount,
                    },
                }
            case "summary":
                return {
                    left: {
                        label: LL.COMMON_BTN_BACK(),
                        onPress: goToPrev,
                        variant: "outline",
                    },
                    right: {
                        label: txError ? LL.COMMON_BTN_TRY_AGAIN() : LL.COMMON_BTN_CONFIRM(),
                        onPress: handleConfirmPress,
                        disabled: !txControls || txControls.isDisabledButtonState,
                    },
                }
            default:
                return {}
        }
    }, [
        LL,
        step,
        flowState.token,
        flowState.amount,
        goToInsertAddress,
        goToSummary,
        goToPrev,
        handleConfirmPress,
        txError,
        txControls,
    ])

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
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" gap={16}>
                    {footerConfig.left && (
                        <BaseButton
                            variant={footerConfig.left.variant ?? "outline"}
                            action={footerConfig.left.onPress}
                            w={48}
                            title={footerConfig.left.label}
                            disabled={footerConfig.left.disabled}
                            haptics="Medium"
                        />
                    )}
                    {footerConfig.right && (
                        <BaseButton
                            action={footerConfig.right.onPress}
                            w={footerConfig.left ? 48 : 100}
                            title={footerConfig.right.label}
                            disabled={footerConfig.right.disabled}
                            haptics="Medium"
                        />
                    )}
                </BaseView>
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
        flexElement: { flex: 1, paddingHorizontal: 8 },
    })
