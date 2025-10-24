import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useReportNFT } from "~Hooks/useReportNFT"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent, COLORS } from "~Constants"
import { useAnalyticTracking, useTheme } from "~Hooks"

type Props = {
    onClose: () => void
    collectionAddress: string
}

export const ReportCollectionBottomsheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, collectionAddress }, ref) => {
        const { LL } = useI18nContext()
        const { reportNFTCollection } = useReportNFT()
        const track = useAnalyticTracking()
        const theme = useTheme()

        const handleProceedToReport = useCallback(() => {
            track(AnalyticsEvent.NFT_COLLECTION_REPORT_INITIATED, {
                nftAddress: collectionAddress,
            })
            reportNFTCollection(collectionAddress)
            onClose()
        }, [onClose, reportNFTCollection, collectionAddress, track])

        const mainButton = (
            <BaseButton
                testID="NFT_Report_Collection_Confirm_Button"
                title={LL.COMMON_BTN_CONFIRM()}
                action={handleProceedToReport}
                haptics="Medium"
                flex={1}
                textColor={COLORS.GREY_50}
                bgColor={COLORS.RED_600}
                typographyFont="bodySemiBold"
            />
        )

        const secondaryButton = (
            <BaseButton
                testID="NFT_Report_Collection_Cancel_Button"
                title={LL.COMMON_BTN_CANCEL()}
                action={onClose}
                variant="outline"
                haptics="Medium"
                flex={1}
                typographyFont="bodySemiBold"
            />
        )

        return (
            <DefaultBottomSheet
                testId="Report_Collection_Bottomsheet"
                ref={ref}
                enablePanDownToClose={false}
                title={LL.NFT_REPORT_COLLECTION()}
                description={LL.COLLECTIBLES_REPORT_PROBLEM_DESCRIPTION()}
                mainButton={mainButton}
                secondaryButton={secondaryButton}
                iconSize={40}
                icon="icon-slash"
                buttonsInLine={true}
                backgroundColor={theme.colors.actionBottomSheet.background}
                textColor={theme.colors.horizontalButtonTextReversed}
            />
        )
    },
)
