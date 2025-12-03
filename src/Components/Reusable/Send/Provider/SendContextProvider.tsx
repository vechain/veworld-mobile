import React, { PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"
import { SharedValue, useSharedValue } from "react-native-reanimated"
import { FungibleTokenWithBalance } from "~Model"

export type SendFlowStep = "insertAddress" | "selectAmount" | "summary"

type SendFlowState = {
    token?: FungibleTokenWithBalance
    amount?: string
    address?: string
}

type SendContextType = {
    flowState: SendFlowState
    setFlowState: (state: SendFlowState) => void
    step: SendFlowStep
    previousStep: SharedValue<SendFlowStep | undefined>
    nextStep: SharedValue<SendFlowStep | undefined>
    goToNext: () => void
    goToPrevious: () => void
    isNextButtonEnabled: boolean
    isPreviousButtonEnabled: boolean
    setIsNextButtonEnabled: (enabled: boolean) => void
    setIsPreviousButtonEnabled: (enabled: boolean) => void
}

const SendContext = React.createContext<SendContextType | undefined>(undefined)

export const SendContextProvider = ({ children }: PropsWithChildren) => {
    const [step, setStep] = useState<SendFlowStep>("selectAmount")
    const [flowState, setFlowState] = useState<SendFlowState>({
        token: undefined,
        amount: "0",
        address: "",
    })

    const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(true)
    const [isPreviousButtonEnabled, setIsPreviousButtonEnabled] = useState(true)

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
                break
        }
    }, [nextStep, previousStep, step])

    const goToPrevious = useCallback(() => {
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

export const useSendContext = () => {
    const context = useContext(SendContext)
    if (!context) {
        throw new Error("useSendContext must be used within a SendContextProvider")
    }
    return context
}
