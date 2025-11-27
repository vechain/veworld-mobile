/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { BaseButton, BaseView, Layout } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { SummaryScreen } from "~Components/Reusable/Send"
import { VET } from "~Constants"

type SendFlowStep = "selectAmount" | "insertAddress" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
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

export const SendScreen = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const [step, setStep] = useState<SendFlowStep>("summary")
    const [flowState, setFlowState] = useState<SendFlowState>({})
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

    const goToSummary = useCallback((amount: string) => {
        setFlowState(current => ({
            ...current,
            amount,
        }))
        setStep("summary")
    }, [])

    const VETWithBalance = useMemo(() => {
        return {
            ...VET,
            balance: {
                balance: "35",
                tokenAddress: VET.address,
                timeUpdated: Date.now().toString(),
                isHidden: false,
            },
        }
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

    const handleBackPress = useCallback(() => {
        switch (step) {
            case "summary":
                setStep("insertAddress")
                break
            case "insertAddress":
                setStep("selectAmount")
                break
            case "selectAmount":
            default:
                navigation.goBack()
                break
        }
    }, [navigation, step])

    const renderStep = useMemo(() => {
        switch (step) {
            case "selectAmount":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step3 logic */}</BaseView>
            case "insertAddress":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step3 logic */}</BaseView>
            case "summary":
                return (
                    <SummaryScreen
                        token={flowState.token}
                        amount={flowState.amount}
                        address={flowState.address}
                        onTxFinished={handleTxFinished}
                        onBindTransactionControls={setTxControls}
                        txError={txError}
                    />
                )
            default:
                return <BaseView flex={1} />
        }
    }, [step, flowState.address, flowState.amount, flowState.token, handleTxFinished, txError])

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
                        onPress: handleBackPress,
                        variant: "outline",
                    },
                    right: {
                        label: LL.COMMON_BTN_NEXT(),
                        onPress: () => {
                            if (flowState.amount) {
                                goToSummary(flowState.amount)
                            }
                        },
                        disabled: !flowState.amount,
                    },
                }
            case "summary":
                return {
                    left: {
                        label: LL.COMMON_BTN_BACK(),
                        onPress: handleBackPress,
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
        handleBackPress,
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
            body={<BaseView flex={1}>{renderStep}</BaseView>}
            footer={
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
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
