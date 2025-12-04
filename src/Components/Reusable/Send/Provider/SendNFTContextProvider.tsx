import React, { PropsWithChildren, useCallback, useMemo, useState } from "react"
import { useSharedValue } from "react-native-reanimated"
import { NonFungibleToken } from "~Model"
import { SendContext, SendContextType, SendFlowState, SendFlowStep } from "./SendContextProvider"

type SendNFTFlowStep = "insertAddress" | "summary"

type SendNFTContextProviderProps = PropsWithChildren<{
    initialNft?: NonFungibleToken
}>

export const SendNFTContextProvider = ({ children, initialNft }: SendNFTContextProviderProps) => {
    const [step, setStep] = useState<SendNFTFlowStep>("insertAddress")
    const [flowState, setFlowState] = useState<SendFlowState>({
        nft: initialNft,
        address: "",
    })

    const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(true)
    const [isPreviousButtonEnabled, setIsPreviousButtonEnabled] = useState(true)

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

    const contextValue: SendContextType = useMemo(
        () => ({
            flowState,
            setFlowState,
            step,
            previousStep,
            nextStep,
            isNextButtonEnabled,
            isPreviousButtonEnabled,
            setIsNextButtonEnabled,
            setIsPreviousButtonEnabled,
            goToNext,
            goToPrevious,
        }),
        [
            flowState,
            setFlowState,
            step,
            previousStep,
            nextStep,
            isNextButtonEnabled,
            isPreviousButtonEnabled,
            setIsNextButtonEnabled,
            setIsPreviousButtonEnabled,
            goToNext,
            goToPrevious,
        ],
    )

    return <SendContext.Provider value={contextValue}>{children}</SendContext.Provider>
}
