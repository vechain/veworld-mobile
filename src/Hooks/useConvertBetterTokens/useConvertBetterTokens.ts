import { useNavigation } from "@react-navigation/native"
import { ethers } from "ethers"
import { useCallback } from "react"
import { Transaction } from "thor-devkit"
import { useThor } from "~Components"
import { abis, AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { Routes } from "~Navigation"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"

export const useConvertBetterTokens = () => {
    const nav = useNavigation()
    const thor = useThor()
    const track = useAnalyticTracking()

    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)

    const b3trWithCompleteInfo = useTokenWithCompleteInfo(B3TR)

    const buildB3trTxClauses = useCallback(
        (amount: string | number): Transaction.Clause[] => {
            const approveAbi = abis.VeBetterDao.B3trAbis.find(_abi => _abi.name === "approve")
            const conversionAbi = abis.VeBetterDao.Vot3Abis.find(_abi => _abi.name === "convertToVOT3")
            if (!conversionAbi || !approveAbi) throw new Error("Function abi not found for mint")

            const spender = VOT3.address
            const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()

            const approveClause = thor.account(B3TR.address).method(approveAbi).asClause(spender, formattedAmount)
            const convertClause = thor.account(VOT3.address).method(conversionAbi).asClause(formattedAmount)

            return [approveClause, convertClause]
        },
        [B3TR.address, VOT3.address, thor],
    )

    const buildVot3TxClauses = useCallback(
        (amount: string | number): Transaction.Clause[] => {
            const functionAbi = abis.VeBetterDao.Vot3Abis.find(_abi => _abi.name === "convertToB3TR")
            if (!functionAbi) throw new Error("Function abi not found for mint")

            const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()

            const clause = thor.account(VOT3.address).method(functionAbi).asClause(formattedAmount)
            return [clause]
        },
        [VOT3.address, thor],
    )

    /**
     * Helpers that create transaction to convert B3TR to VOT3 token
     */
    const convertB3tr = useCallback(
        (amount: string | number) => {
            const clauses = buildB3trTxClauses(amount)
            track(AnalyticsEvent.CONVERT_B3TR_VOT3)
            nav.navigate(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
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
