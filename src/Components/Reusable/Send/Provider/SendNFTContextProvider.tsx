import React, { PropsWithChildren, useCallback, useMemo, useState } from "react"
import { useSharedValue } from "react-native-reanimated"
import { NonFungibleToken } from "~Model"
import {
    EnteringFromLeftAnimation,
    EnteringFromRightAnimation,
} from "~Screens/Flows/App/SendScreen/Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "~Screens/Flows/App/SendScreen/Animations/Exiting"
import { SendContext, SendContextType, SendFlowState, SendFlowStep } from "./SendContextProvider"

type SendNFTFlowStep = "insertAddress" | "summary"

const ORDER: SendNFTFlowStep[] = ["insertAddress", "summary"]

type SendNFTContextProviderProps = PropsWithChildren<{
    initialNft?: NonFungibleToken
}>

export const SendNFTContextProvider = ({ children, initialNft }: SendNFTContextProviderProps) => {
    const [step, setStep] = useState<SendNFTFlowStep>("insertAddress")
    const [flowState, setFlowState] = useState<SendFlowState>({
        nft: initialNft,
        address: "",
    })

    const previousStep = useSharedValue<SendFlowStep | undefined>(undefined)
    const nextStep = useSharedValue<SendFlowStep | undefined>(undefined)

    const goToNext = useCallback(() => {
        switch (step) {
            case "insertAddress":
                nextStep.value = "summary"
                previousStep.value = step
                setStep("summary")
                break
        }
    }, [nextStep, previousStep, step])

    const goToPrevious = useCallback(() => {
        switch (step) {
            case "summary":
                nextStep.value = "insertAddress"
                previousStep.value = step
                setStep("insertAddress")
                break
        }
    }, [nextStep, previousStep, step])

    const EnteringAnimation = useCallback(
        (values: Parameters<typeof EnteringFromRightAnimation>[0]) => {
            "worklet"
            if (!previousStep.value || !nextStep.value)
                return {
                    initialValues: values,
                    animations: {},
                }
            if (ORDER.indexOf(nextStep.value as SendNFTFlowStep) > ORDER.indexOf(previousStep.value as SendNFTFlowStep))
                return EnteringFromRightAnimation(values)
            return EnteringFromLeftAnimation(values)
        },
        [nextStep.value, previousStep.value],
    )

    const ExitingAnimation = useCallback(
        (values: Parameters<typeof ExitingToLeftAnimation>[0]) => {
            "worklet"
            if (!previousStep.value || !nextStep.value)
                return {
                    initialValues: values,
                    animations: {},
                }
            if (ORDER.indexOf(nextStep.value as SendNFTFlowStep) > ORDER.indexOf(previousStep.value as SendNFTFlowStep))
                return ExitingToLeftAnimation(values)
            return ExitingToRightAnimation(values)
        },
        [nextStep.value, previousStep.value],
    )

    const contextValue: SendContextType = useMemo(
        () => ({
            flowState,
            setFlowState,
            step,
            goToNext,
            goToPrevious,
            EnteringAnimation,
            ExitingAnimation,
        }),
        [flowState, step, goToNext, goToPrevious, EnteringAnimation, ExitingAnimation],
    )

    return <SendContext.Provider value={contextValue}>{children}</SendContext.Provider>
}
