import { useNavigation } from "@react-navigation/native"
import { ethers } from "ethers"
import { useCallback } from "react"
import { abi, Transaction } from "thor-devkit"
import { abis, AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { Routes } from "~Navigation"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

export const useConvertBetterTokens = () => {
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const b3trWithCompleteInfo = useTokenWithCompleteInfo(B3TR)

    const buildB3trTxClauses = useCallback(
        (amount: string | number): Transaction.Clause[] => {
            const approveAbi = abis.VeBetterDao.B3trAbis.approve
            const conversionAbi = abis.VeBetterDao.Vot3Abis.convertToVOT3
            if (!conversionAbi || !approveAbi) throw new Error("Function abi not found for mint")

            const spender = VOT3.address
            const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()

            const approveData = new abi.Function(approveAbi).encode(spender, formattedAmount)
            const convertData = new abi.Function(conversionAbi).encode(formattedAmount)

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
        (amount: string | number): Transaction.Clause[] => {
            const functionAbi = abis.VeBetterDao.Vot3Abis.convertToB3TR
            if (!functionAbi) throw new Error("Function abi not found for mint")

            const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()

            const convertData = new abi.Function(functionAbi).encode(formattedAmount)

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
        (amount: string | number) => {
            const clauses = buildB3trTxClauses(amount)
            track(AnalyticsEvent.CONVERT_B3TR_VOT3)
            nav.navigate(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
                amount: BigNutils(amount).toString,
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
        (amount: string | number) => {
            const clauses = buildVot3TxClauses(amount)
            track(AnalyticsEvent.CONVERT_B3TR_VOT3)
            nav.navigate(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
                amount: BigNutils(amount).toString,
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
