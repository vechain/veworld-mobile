/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "~Hooks"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useRef, useState } from "react"
import { BaseButton, BaseView, Layout } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { SelectAmountSendComponent } from "./02-SelectAmountSendScreen/SelectAmountSendComponent"

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

export const SendScreen = (): ReactElement => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const navigation = useNavigation<NavigationProps>()
    const route = useRoute<RouteProps>()
    const [step, setStep] = useState<SendFlowStep>("selectAmount")
    const [flowState, setFlowState] = useState<SendFlowState>({
        token: route.params?.token,
    })
    const [isAmountValid, setIsAmountValid] = useState(false)
    const [isAmountError, setIsAmountError] = useState(false)

    const handleNextRef = useRef<(() => void) | null>(null)

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    const goToInsertAddress = useCallback((amount: string, token: FungibleTokenWithBalance, fiatAmount?: string) => {
        setFlowState(current => ({
            ...current,
            amount,
            token,
            fiatAmount,
            // reset downstream state when amount/token changes
            address: undefined,
        }))
        setStep("insertAddress")
    }, [])

    const goToSummary = useCallback((address: string) => {
        setFlowState(current => ({
            ...current,
            address,
        }))
        setStep("summary")
    }, [])

    const goBackToSelectAmount = useCallback(() => {
        setStep("selectAmount")
    }, [])

    const goBackToInsertAddress = useCallback(() => {
        setStep("insertAddress")
    }, [])

    const renderStep = useMemo(() => {
        // TODO(send-flow-v2): Implement proper step types based on the logic implemented in each child step component
        switch (step) {
            case "selectAmount":
                return (
                    <SelectAmountSendComponent
                        token={flowState.token}
                        onNext={goToInsertAddress}
                        onValidationChange={(isValid, isError) => {
                            setIsAmountValid(isValid)
                            setIsAmountError(isError)
                        }}
                        onBindNextHandler={handler => {
                            handleNextRef.current = handler
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
                        onPress: () => handleNextRef.current?.(),
                        disabled: isAmountError || !isAmountValid,
                    },
                }
            case "insertAddress":
                return {} // TODO: implement when step is ready
            case "summary":
                return {} // TODO: implement when step is ready
            default:
                return {}
        }
    }, [step, LL, isAmountError, isAmountValid])

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            body={<BaseView flex={1}>{renderStep}</BaseView>}
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
