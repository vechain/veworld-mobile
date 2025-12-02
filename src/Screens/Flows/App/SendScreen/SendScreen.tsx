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
    useSharedValue,
} from "react-native-reanimated"
import { BaseButton, BaseView, Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { ReceiverScreen } from "~Components/Reusable/Send"
import { useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { useI18nContext } from "~i18n"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "./Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "./Animations/Exiting"

type SendFlowStep = "selectAmount" | "insertAddress" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    address?: string
    amount?: string
}

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

const ORDER: SendFlowStep[] = ["selectAmount", "insertAddress", "summary"]

const AnimatedBaseButton = Animated.createAnimatedComponent(wrapFunctionComponent(BaseButton))
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

export const SendScreen = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const [step, setStep] = useState<SendFlowStep>("selectAmount")
    const [flowState, setFlowState] = useState<SendFlowState>({})
    const { styles } = useThemedStyles(baseStyles)

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    const previousStep = useSharedValue<typeof step | undefined>(undefined)
    const nextStep = useSharedValue<typeof step | undefined>(undefined)

    const goToNext = useCallback(() => {
        switch (step) {
            case "selectAmount":
                nextStep.value = "insertAddress"
                previousStep.value = step
                setStep("insertAddress")
                break
            case "insertAddress":
                nextStep.value = "summary"
                previousStep.value = step
                setStep("summary")
        }
    }, [nextStep, previousStep, step])

    const goToPrev = useCallback(() => {
        switch (step) {
            case "insertAddress":
                nextStep.value = "selectAmount"
                previousStep.value = step
                setStep("selectAmount")
                break
            case "summary":
                nextStep.value = "insertAddress"
                previousStep.value = step
                setStep("insertAddress")
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

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            hasSafeArea
            fixedBody={
                <Animated.View style={[styles.container, styles.flexElement]}>
                    <Animated.View style={styles.flexElement} entering={Entering} exiting={Exiting} key={step}>
                        {step === "selectAmount" && <></>}
                        {step === "insertAddress" && (
                            <ReceiverScreen
                                selectedAddress={flowState.address}
                                onAddressChange={address => setFlowState(current => ({ ...current, address: address }))}
                            />
                        )}
                        {step === "summary" && <></>}
                    </Animated.View>

                    <AnimatedBaseView flexDirection="row" gap={16} px={16} pb={16} layout={LinearTransition}>
                        {step !== "selectAmount" && (
                            <AnimatedBaseButton
                                variant="outline"
                                flex={1}
                                action={goToPrev}
                                layout={LinearTransition}
                                entering={FadeInLeft.delay(50)}
                                exiting={FadeOutLeft}>
                                {LL.COMMON_LBL_BACK()}
                            </AnimatedBaseButton>
                        )}
                        <AnimatedBaseButton
                            flex={1}
                            action={goToNext}
                            disabled={step === "summary"}
                            layout={LinearTransition}>
                            {LL.COMMON_LBL_NEXT()}
                        </AnimatedBaseButton>
                    </AnimatedBaseView>
                </Animated.View>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: { paddingBottom: 36 },
        flexElement: { flex: 1 },
    })
