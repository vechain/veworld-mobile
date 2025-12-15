import React, { PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"
import { EntryAnimationsValues, ExitAnimationsValues, LayoutAnimation, useSharedValue } from "react-native-reanimated"
import { FungibleTokenWithBalance } from "~Model"
import {
    EnteringFromLeftAnimation,
    EnteringFromRightAnimation,
} from "~Screens/Flows/App/SendScreen/Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "~Screens/Flows/App/SendScreen/Animations/Exiting"

export type SendFlowStep = "insertAddress" | "selectAmount" | "summary"

export type SendFlowState = {
    type: "token"
    token?: FungibleTokenWithBalance
    amount?: string
    fiatAmount?: string
    address?: string
    /**
     * Exchange rate used when the user selected the amount.
     * This is passed down to the summary step to detect subsequent market moves.
     */
    initialExchangeRate?: number | null
    amountInFiat?: boolean
}

export type SendNFTFlowState = {
    type: "nft"
    contractAddress: string
    tokenId: string
    address?: string
}

export type SendContextType<T = SendFlowState | SendNFTFlowState> = {
    flowState: T
    setFlowState: React.Dispatch<React.SetStateAction<T>>
    step: SendFlowStep
    goToNext: () => void
    goToPrevious: () => void
    EnteringAnimation: (values: EntryAnimationsValues) => LayoutAnimation
    ExitingAnimation: (values: ExitAnimationsValues) => LayoutAnimation
}

export const SendContext = React.createContext<SendContextType<any> | undefined>(undefined)

type SendContextProviderProps = PropsWithChildren<{
    initialFlowState: SendFlowState | SendNFTFlowState
}>

const ORDER: SendFlowStep[] = ["selectAmount", "insertAddress", "summary"]

export const SendContextProvider = ({ children, initialFlowState }: SendContextProviderProps) => {
    const initialStep: SendFlowStep = initialFlowState.type === "token" ? "selectAmount" : "insertAddress"

    const [step, setStep] = useState<SendFlowStep>(initialStep)
    const [flowState, setFlowState] = useState<SendFlowState | SendNFTFlowState>(initialFlowState)

    const previousStep = useSharedValue<SendFlowStep | undefined>(undefined)
    const nextStep = useSharedValue<SendFlowStep | undefined>(undefined)

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
                if (flowState.type === "token") {
                    nextStep.value = "selectAmount"
                    previousStep.value = step
                    setStep("selectAmount")
                }
                break
            case "summary":
                nextStep.value = "insertAddress"
                previousStep.value = step
                setStep("insertAddress")
                break
        }
    }, [nextStep, previousStep, step, flowState.type])

    const EnteringAnimation = useCallback(
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

    const ExitingAnimation = useCallback(
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

    const contextValue: SendContextType<SendFlowState | SendNFTFlowState> = useMemo(
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

export const useSendContext = () => {
    const context = useContext(SendContext)
    if (!context) {
        throw new Error("useSendContext must be used within a SendContextProvider")
    }
    return context as SendContextType<SendFlowState | SendNFTFlowState>
}

export const useTokenSendContext = () => {
    return useSendContext() as SendContextType<SendFlowState>
}

export const useNFTSendContext = () => {
    return useSendContext() as SendContextType<SendNFTFlowState>
}
