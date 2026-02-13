import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useReportNFT } from "~Hooks/useReportNFT"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"

type Props = {
    onClose: () => void
    nftAddress: string
}

export const NFTReportCollectionBottomsheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, nftAddress }, ref) => {
        const { LL } = useI18nContext()
        const { reportNFTCollection } = useReportNFT()
        const track = useAnalyticTracking()

        const handleProceedToReport = useCallback(() => {
            track(AnalyticsEvent.NFT_COLLECTION_REPORT_INITIATED, {
                nftAddress: nftAddress,
            })
            reportNFTCollection(nftAddress)
            onClose()
        }, [onClose, reportNFTCollection, nftAddress, track])

        const mainButton = (
            <BaseButton
                testID="NFT_Report_Collection_Confirm_Button"
                title={LL.NFT_REPORT_COLLECTION_CONFIRM()}
                action={handleProceedToReport}
                haptics="Medium"
            />
        )

        const secondaryButton = (
            <BaseButton
                testID="NFT_Report_Collection_Cancel_Button"
                title={LL.COMMON_BTN_CANCEL()}
                action={onClose}
                variant="outline"
                haptics="Medium"
            />
        )

        return (
            <DefaultBottomSheet
                testId="NFT_Report_Collection_Bottomsheet"
                ref={ref}
                title={LL.NFT_REPORT_COLLECTION()}
                description={LL.NFT_REPORT_COLLECTION_MSG()}
                mainButton={mainButton}
                secondaryButton={secondaryButton}
                iconSize={40}
                icon="icon-alert-triangle"
            />
        )
    },
)
