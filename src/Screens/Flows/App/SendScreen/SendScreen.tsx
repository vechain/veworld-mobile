/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { EntryAnimationsValues, ExitAnimationsValues, useSharedValue } from "react-native-reanimated"
import { BaseButton, BaseText, BaseView, Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { useTheme, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "./Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "./Animations/Exiting"

// TODO(send-flow-v2): Add proper step types based on the logic implemented in each child step component
type SendFlowStep = "insertAddress" | "selectAmount" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

const ORDER: SendFlowStep[] = ["insertAddress", "selectAmount", "summary"]

export const SendScreen = (): ReactElement => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const navigation = useNavigation<NavigationProps>()
    const [step, setStep] = useState<SendFlowStep>("insertAddress")
    const [flowState, setFlowState] = useState<SendFlowState>({})
    const { styles } = useThemedStyles(baseStyles)

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

    const previousStep = useSharedValue<typeof step | undefined>(undefined)
    const nextStep = useSharedValue<typeof step | undefined>(undefined)

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

    const backgroundColor = useMemo(() => {
        switch (step) {
            case "insertAddress":
                return "green"
            case "selectAmount":
                return "red"
            case "summary":
                return "blue"
        }
    }, [step])

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={styles.flexElement}>
                    <Animated.View
                        style={[
                            styles.flexElement,
                            {
                                backgroundColor,
                            },
                        ]}
                        entering={Entering}
                        exiting={Exiting}
                        key={step}>
                        <BaseView style={styles.mockedBox}>
                            <BaseText typographyFont="biggerTitle">{step}</BaseText>
                        </BaseView>
                    </Animated.View>

                    <BaseView flexDirection="row" gap={16}>
                        <BaseButton action={goToPrev} disabled={step === "insertAddress"}>
                            {LL.COMMON_LBL_BACK()}
                        </BaseButton>
                        <BaseButton action={goToNext} disabled={step === "summary"}>
                            {LL.COMMON_LBL_NEXT()}
                        </BaseButton>
                    </BaseView>
                </Animated.View>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        flexElement: { flex: 1 },
        mockedBox: {
            width: "100%",
            height: 300,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
    })
