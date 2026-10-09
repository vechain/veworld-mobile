import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ethers } from "ethers"
import { useCallback, useMemo } from "react"
import { abi, Transaction } from "thor-devkit"
import { abis, AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { useGetVot3Delegatee } from "~Hooks/VeBetterDao/useGetVot3Delegatee"
import { DEVICE_TYPE } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectNetworkVBDTokens, selectSelectedAccountOrNull, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useConvertBetterTokens = () => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const track = useAnalyticTracking()
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const b3trWithCompleteInfo = useTokenWithCompleteInfo(B3TR)

    // VOT3 self-delegates on mint only for EOAs, so a smart account would mint VOT3
    // with no delegatee and zero voting power. Read its delegation state to know
    // whether the convert bundle must delegate to itself first.
    const isSmartWallet = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET
    const { data: vot3Delegatee, isSuccess: isVot3DelegateeLoaded } = useGetVot3Delegatee({ enabled: isSmartWallet })

    const isConvertB3trDisabled = useMemo(
        () => isSmartWallet && (!isVot3DelegateeLoaded || !vot3Delegatee),
        [isSmartWallet, isVot3DelegateeLoaded, vot3Delegatee],
    )

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

            if (!isSmartWallet || !selectedAccount) return clauses

            // Never guess: delegate() overwrites an existing delegation, so an unknown
            // delegation state must block the conversion instead of being assumed.
            if (!isVot3DelegateeLoaded || !vot3Delegatee) throw new Error("VOT3 delegatee not loaded")

            if (!AddressUtils.compareAddresses(vot3Delegatee, ethers.constants.AddressZero)) return clauses

            const delegateAbi = abis.VeBetterDao.Vot3Abis.delegate
            if (!delegateAbi) throw new Error("Function abi not found for delegate")

            const delegateData = new abi.Function(delegateAbi).encode(selectedAccount.address)

            return [
                {
                    to: VOT3.address,
                    data: delegateData,
                    value: "0x0",
                },
                ...clauses,
            ]
        },
        [B3TR.address, VOT3.address, isSmartWallet, isVot3DelegateeLoaded, vot3Delegatee, selectedAccount],
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
        isConvertB3trDisabled,
    }
}
