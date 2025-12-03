/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme, useThemedStyles } from "~Hooks"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { EntryAnimationsValues, ExitAnimationsValues, useSharedValue } from "react-native-reanimated"
import { BaseButton, BaseView, Layout, SendContextProvider } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { SelectAmountSendComponent } from "./02-SelectAmountSendScreen/SelectAmountSendComponent"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "./Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "./Animations/Exiting"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

// TODO(send-flow-v2): Add proper step types based on the logic implemented in each child step component
type SendFlowStep = "selectAmount" | "insertAddress" | "summary"

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

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
    fiatAmount?: string
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>
type RouteProps = NativeStackScreenProps<RootStackParamListHome, Routes.SEND_TOKEN>["route"]

const ORDER: SendFlowStep[] = ["selectAmount", "insertAddress", "summary"]

export const SendScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const navigation = useNavigation<NavigationProps>()
    const route = useRoute<RouteProps>()
    const [step, setStep] = useState<SendFlowStep>("selectAmount")
    const [flowState, setFlowState] = useState<SendFlowState>({
        token: route.params?.token,
    })
    const [isNextDisabled, setIsNextDisabled] = useState(true)

    const amountHandlerRef = useRef<(() => void) | null>(null)
    const previousStep = useSharedValue<typeof step | undefined>(undefined)
    const nextStep = useSharedValue<typeof step | undefined>(undefined)

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    const goToInsertAddress = useCallback(
        (amount: string, token: FungibleTokenWithBalance, fiatAmount?: string) => {
            setFlowState(current => ({
                ...current,
                amount,
                token,
                fiatAmount,
                // reset downstream state when amount/token changes
                address: undefined,
            }))
            nextStep.value = "insertAddress"
            previousStep.value = step
            setStep("insertAddress")
        },
        [nextStep, previousStep, step],
    )

    const goToSummary = useCallback(
        (address: string) => {
            setFlowState(current => ({
                ...current,
                address,
            }))
            nextStep.value = "summary"
            previousStep.value = step
            setStep("summary")
        },
        [nextStep, previousStep, step],
    )

    const goBackToSelectAmount = useCallback(() => {
        nextStep.value = "selectAmount"
        previousStep.value = step
        setStep("selectAmount")
    }, [nextStep, previousStep, step])

    const goBackToInsertAddress = useCallback(() => {
        nextStep.value = "insertAddress"
        previousStep.value = step
        setStep("insertAddress")
    }, [nextStep, previousStep, step])

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

    const renderStep = useMemo(() => {
        // TODO(send-flow-v2): Implement proper step types based on the logic implemented in each child step component
        switch (step) {
            case "selectAmount":
                return (
                    <SelectAmountSendComponent
                        token={flowState.token}
                        onNext={goToInsertAddress}
                        onBindNextHandler={config => {
                            amountHandlerRef.current = config.handler
                            setIsNextDisabled(config.isError || !config.isValid)
                        }}
                    />
                )
            case "insertAddress":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step2 logic */}</BaseView>
            case "summary":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step4 logic */}</BaseView>
            default:
                return <BaseView flex={1} />
        }
    }, [step, flowState.token, goToInsertAddress])

    const footerConfig: FooterConfig = useMemo(() => {
        switch (step) {
            case "selectAmount":
                return {
                    right: {
                        label: LL.COMMON_BTN_NEXT(),
                        onPress: () => amountHandlerRef.current?.(),
                        disabled: isNextDisabled,
                    },
                }
            case "insertAddress":
                return {} // TODO: implement when step is ready
            case "summary":
                return {} // TODO: implement when step is ready
            default:
                return {}
        }
    }, [step, LL, isNextDisabled])

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={styles.flexElement} entering={Entering} exiting={Exiting} key={step}>
                    {renderStep}
                </Animated.View>
            }
            footer={
                <BaseView flexDirection="row" justifyContent="space-between" pt={16} bg={theme.colors.background}>
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
        flexElement: { flex: 1, paddingHorizontal: 24 },
    })
