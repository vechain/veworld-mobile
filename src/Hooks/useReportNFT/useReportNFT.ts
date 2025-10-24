import { useNavigation, CommonActions } from "@react-navigation/native"
import { useCallback } from "react"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useNFTReportTransaction } from "~Hooks/useNFTReportTransaction"
import { Routes } from "~Navigation"
import { error } from "~Utils/Logger"

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

            try {
                let rootNav: any = navigation
                let depth = 0
                while (rootNav?.getParent && rootNav.getParent()) {
                    rootNav = rootNav.getParent()
                    depth += 1
                    if (depth > 8) break
                }

                rootNav.dispatch(
                    CommonActions.navigate({
                        name: "TabStack",
                        params: {
                            screen: "NFTStack",
                            params: {
                                screen: Routes.REPORT_NFT_TRANSACTION_SCREEN,
                                params: {
                                    nftAddress,
                                    transactionClauses: clause,
                                },
                            },
                        },
                    }),
                )

                setTimeout(() => {
                    try {
                        rootNav.dispatch(
                            CommonActions.navigate({
                                name: "TabStack",
                                params: {
                                    screen: "NFTStack",
                                },
                            }),
                        )
                    } catch (e1) {
                        error("NFT", "useReportNFT: fallback step 1 error", e1 as any)
                    }

                    setTimeout(() => {
                        try {
                            rootNav.dispatch(
                                CommonActions.navigate({
                                    name: "TabStack",
                                    params: {
                                        screen: "NFTStack",
                                        params: {
                                            screen: Routes.REPORT_NFT_TRANSACTION_SCREEN,
                                            params: {
                                                nftAddress,
                                                transactionClauses: clause,
                                            },
                                        },
                                    },
                                }),
                            )
                        } catch (e2) {
                            error("NFT", "useReportNFT: fallback step 2 error", e2 as any)
                        }
                    }, 200)
                }, 150)
            } catch (e) {
                error("NFT", "useReportNFT: navigation dispatch error (outer)", e as any)
            }
        },
        [buildReportClause, navigation, track],
    )

    return {
        reportNFTCollection,
    }
}
