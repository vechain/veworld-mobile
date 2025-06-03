import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useCallback } from "react"
import { abi, Transaction } from "thor-devkit"
import { abis, AnalyticsEvent } from "~Constants"
import { NFT_BLACKLIST_CONTRACT, NFT_BLACKLIST_CONTRACT_TESTNET } from "~Constants/Constants/NFT"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useBlockchainNetwork } from "~Hooks/useBlockchainNetwork"
import { RootStackParamListNFT, Routes } from "~Navigation"

export const useReportNFT = () => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListNFT>>()
    const track = useAnalyticTracking()
    const { isMainnet } = useBlockchainNetwork()

    const blacklistContract = isMainnet ? NFT_BLACKLIST_CONTRACT : NFT_BLACKLIST_CONTRACT_TESTNET

    const buildReportTxClause = useCallback(
        (nftAddress: string): Transaction.Clause[] => {
            const reportAbi = abis.NFTBlacklist.NFTBlacklistAbis.report
            if (!reportAbi) throw new Error("Function abi not found for reporting NFT collection")
            const reportData = new abi.Function(reportAbi).encode(nftAddress)
            return [
                {
                    to: blacklistContract,
                    data: reportData,
                    value: "0x0",
                },
            ]
        },
        [blacklistContract],
    )

    const reportNFTCollection = useCallback(
        (nftAddress: string) => {
            const clause = buildReportTxClause(nftAddress)

            track(AnalyticsEvent.NFT_COLLECTION_REPORTED, {
                nftAddress: nftAddress,
            })

            nav.replace(Routes.REPORT_NFT_TRANSACTION_SCREEN, {
                nftAddress,
                transactionClauses: clause,
            })
        },
        [buildReportTxClause, nav, track],
    )

    return {
        reportNFTCollection,
    }
}
