/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from "@react-navigation/native"
import { StyleSheet } from "react-native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { BaseIcon, BaseView, Layout } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import FontUtils from "~Utils/FontUtils"

type SendFlowStep = "selectToken" | "insertAddress" | "selectAmount" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

/**
 * SendScreenV2
 *
 * Wrapper screen responsible only for:
 * - Rendering the common header (title + right close icon)
 * - Keeping the internal send flow state (token, address, amount)
 * - Rendering the current step component
 * - Closing itself (navigate back) via the header close icon
 *
 * All navigation *within* the send flow (moving between steps, submitting, etc.)
 * is delegated to the child step components via callbacks.
 */
export const SendScreenV2 = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [step, setStep] = useState<SendFlowStep>("selectToken")
    const [flowState, setFlowState] = useState<SendFlowState>({})

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => (
            <BaseIcon
                name="icon-x"
                size={16}
                testID="Send_Screen_Close"
                action={handleClose}
                style={styles.iconContainer}
                color={theme.colors.sendBottomSheet.iconColor}
            />
        ),
        [handleClose, styles.iconContainer, theme.colors.sendBottomSheet.iconColor],
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

    const goBackToTokenSelection = useCallback(() => {
        setStep("selectToken")
    }, [])

    const goBackToInsertAddress = useCallback(() => {
        if (!flowState.token) {
            setStep("selectToken")
            return
        }
        setStep("insertAddress")
    }, [flowState.token])

    const renderStep = useMemo(() => {
        switch (step) {
            case "selectToken":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step1 logic */}</BaseView>
            case "insertAddress":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step2 logic */}</BaseView>
            case "selectAmount":
                return <BaseView flex={1}>{/* TODO(send-flow-v2): Implement step3 logic */}</BaseView>
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
            fixedBody={<BaseView flex={1}>{renderStep}</BaseView>}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            padding: 8,
            width: 32,
            height: 32,
            backgroundColor: theme.colors.sendBottomSheet.iconBackgroundColor,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.sendBottomSheet.iconBorderColor,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            alignSelf: "center",
            color: theme.colors.sendBottomSheet.titleColor,
            fontSize: FontUtils.font(16),
            fontWeight: "600",
            lineHeight: 24,
            textAlign: "center",
        },
    })
