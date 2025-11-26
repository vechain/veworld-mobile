/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Hooks"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { BaseView, Layout } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { ReceiverScreen } from "~Components/Reusable/Send"

// TODO(send-flow-v2): Add proper step types based on the logic implemented in each child step component
type SendFlowStep = "selectAmount" | "insertAddress" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

export const SendScreen = (): ReactElement => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const navigation = useNavigation<NavigationProps>()
    const [step, setStep] = useState<SendFlowStep>("insertAddress")
    const [flowState, setFlowState] = useState<SendFlowState>({})

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

    const renderStep = useMemo(() => {
        // TODO(send-flow-v2): Implement proper step types based on the logic implemented in each child step component
        switch (step) {
            case "selectAmount":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step3 logic */}</BaseView>
            case "insertAddress":
                return <ReceiverScreen />
            case "summary":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step4 logic */}</BaseView>
            default:
                return <BaseView flex={1} />
        }
    }, [step])

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <BaseView flex={1} p={16}>
                    {renderStep}
                </BaseView>
            }
        />
    )
}
