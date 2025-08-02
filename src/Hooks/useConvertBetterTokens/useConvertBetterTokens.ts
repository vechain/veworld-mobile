import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useCallback } from "react"
import { abi, Transaction } from "thor-devkit"
import { abis, AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"

export const useConvertBetterTokens = () => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const track = useAnalyticTracking()
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const b3trWithCompleteInfo = useTokenWithCompleteInfo(B3TR)

    const buildB3trTxClauses = useCallback(
        (amount: string): Transaction.Clause[] => {
            const approveAbi = abis.VeBetterDao.B3trAbis.approve
            const conversionAbi = abis.VeBetterDao.Vot3Abis.convertToVOT3
            if (!conversionAbi || !approveAbi) throw new Error("Function abi not found for mint")

            const spender = VOT3.address

            const approveData = new abi.Function(approveAbi).encode(spender, amount)
            const convertData = new abi.Function(conversionAbi).encode(amount)

            const clauses: Transaction.Clause[] = [
                {
                    to: B3TR.address,
                    data: approveData,
                    value: "0x0",
                },
                {
                    to: VOT3.address,
                    data: convertData,
                    value: "0x0",
                },
            ]

            return clauses
        },
        [B3TR.address, VOT3.address],
    )

    const buildVot3TxClauses = useCallback(
        (amount: string): Transaction.Clause[] => {
            const functionAbi = abis.VeBetterDao.Vot3Abis.convertToB3TR
            if (!functionAbi) throw new Error("Function abi not found for mint")

            const convertData = new abi.Function(functionAbi).encode(amount)

            const clauses: Transaction.Clause[] = [
                {
                    to: VOT3.address,
                    data: convertData,
                    value: "0x0",
                },
            ]
            return clauses
        },
        [VOT3.address],
    )

    /**
     * Helpers that create transaction to convert B3TR to VOT3 token
     */
    const convertB3tr = useCallback(
        (amount: string, formattedAmount: string) => {
            const clauses = buildB3trTxClauses(amount)
            track(AnalyticsEvent.CONVERT_B3TR_VOT3, {
                from: "B3TR",
                to: "VOT3",
            })
            nav.replace(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
                amount: formattedAmount,
                transactionClauses: clauses,
                token: b3trWithCompleteInfo,
            })
        },
        [b3trWithCompleteInfo, buildB3trTxClauses, nav, track],
    )

    /**
     * Helper that create transaction to convert VOT3 to B3TR token
     */
    const convertVot3 = useCallback(
        (amount: string, formattedAmount: string) => {
            const clauses = buildVot3TxClauses(amount)
            track(AnalyticsEvent.CONVERT_B3TR_VOT3, {
                from: "VOT3",
                to: "B3TR",
            })
            nav.replace(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
                amount: formattedAmount,
                transactionClauses: clauses,
                token: b3trWithCompleteInfo,
            })
        },
        [b3trWithCompleteInfo, buildVot3TxClauses, nav, track],
    )

    return {
        convertB3tr,
        convertVot3,
    }
}
