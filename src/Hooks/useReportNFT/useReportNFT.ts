import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useNFTReportTransaction } from "~Hooks/useNFTReportTransaction"
import { Routes } from "~Navigation"

export const useReportNFT = () => {
    const navigation = useNavigation()
    const track = useAnalyticTracking()
    const { buildReportClause } = useNFTReportTransaction()

    const reportNFTCollection = useCallback(
        (nftAddress: string) => {
            const clause = buildReportClause(nftAddress)

            track(AnalyticsEvent.NFT_COLLECTION_REPORTED, {
                nftAddress: nftAddress,
            })

            navigation.navigate(Routes.REPORT_NFT_TRANSACTION_SCREEN, {
                nftAddress,
                transactionClauses: clause,
            })
        },
        [buildReportClause, navigation, track],
    )

    return {
        reportNFTCollection,
    }
}
