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

            // @ts-ignore - Cross-stack navigation typing
            navigation.navigate(Routes.NFTS, {
                screen: Routes.REPORT_NFT_TRANSACTION_SCREEN,
                params: {
                    nftAddress,
                    transactionClauses: clause,
                },
            })
        },
        [buildReportClause, navigation, track],
    )

    return {
        reportNFTCollection,
    }
}
