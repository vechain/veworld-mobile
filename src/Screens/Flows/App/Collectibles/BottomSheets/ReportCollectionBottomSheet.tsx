import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent, COLORS } from "~Constants"
import { useAnalyticTracking, useNFTReportTransaction, useTheme } from "~Hooks"
import { Routes } from "~Navigation"
import { error as logError } from "~Utils/Logger"

type Props = {
    onClose: () => void
    collectionAddress: string
}

export const ReportCollectionBottomsheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, collectionAddress }, ref) => {
        const { LL } = useI18nContext()
        const track = useAnalyticTracking()
        const theme = useTheme()
        const navigation = useNavigation()
        const { buildReportClause } = useNFTReportTransaction()

        const handleProceedToReport = useCallback((): void => {
            try {
                const clause = buildReportClause(collectionAddress)

                track(AnalyticsEvent.NFT_COLLECTION_REPORT_INITIATED, {
                    nftAddress: collectionAddress,
                })

                onClose()

                navigation.navigate(Routes.REPORT_NFT_TRANSACTION_SCREEN, {
                    nftAddress: collectionAddress,
                    transactionClauses: clause,
                })
            } catch (error) {
                logError("NFT", "Failed to build report clause", error as Error)
            }
        }, [onClose, collectionAddress, track, buildReportClause, navigation])

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
                title={LL.NFT_REPORT_BLOCK_COLLECTION()}
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
