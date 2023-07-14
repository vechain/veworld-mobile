import React, { memo, useMemo } from "react"
import { VTHO, currencySymbolMap, genesisesId } from "~Constants"
import { FormattingUtils, TransactionUtils } from "~Utils"
import { BaseSpacer } from "~Components"
import { useCopyClipboard } from "~Hooks"
import {
    selectCurrency,
    selectTokensWithInfo,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { ActivityStatus, DappTxActivity } from "~Model"
import { ActivityDetail } from "../../Type"
import { useGasFee } from "../../Hooks"
import { ClausesCarousel } from "./ClausesCarousel"
import { ActivityDetailItem } from "../ActivityDetailItem"
import { Linking } from "react-native"

type Props = {
    activity: DappTxActivity
}

export const DappTransactionDetails: React.FC<Props> = memo(({ activity }) => {
    const { LL } = useI18nContext()

    const network = useMemo(() => {
        return activity.genesisId === genesisesId.main
            ? LL.NETWORK_LABEL_MAINNET()
            : LL.NETWORK_LABEL_TESTNET()
    }, [LL, activity.genesisId])

    const currency = useAppSelector(selectCurrency)

    const { gasFeeInVTHOHumanReadable, fiatValueGasFeeSpent } =
        useGasFee(activity)

    const tokens = useAppSelector(selectTokensWithInfo)

    const clausesMetadata = TransactionUtils.interpretClauses(
        activity.clauses ?? [],
        tokens,
    )

    const transactionIDshort = useMemo(() => {
        return FormattingUtils.humanAddress(activity.id, 7, 9)
    }, [activity.id])

    const txStatus = useMemo(() => {
        switch (activity.status) {
            case ActivityStatus.PENDING:
                return LL.ACTIVITIES_STATUS_pending()
            case ActivityStatus.REVERTED:
                return LL.ACTIVITIES_STATUS_reverted()
            case ActivityStatus.SUCCESS:
                return LL.ACTIVITIES_STATUS_success()
        }
    }, [LL, activity.status])

    const { onCopyToClipboard } = useCopyClipboard()

    const blockNumber = useMemo(() => {
        return activity.blockNumber
    }, [activity.blockNumber])

    // Details List
    const details: Array<ActivityDetail> = [
        {
            id: 1,
            title: LL.COMMON_LBL_NAME(),
            value: activity.name ?? "",
            typographyFont: "subSubTitleLight",
            underline: false,
        },
        {
            id: 2,
            title: LL.ORIGIN(),
            value: activity.linkUrl ?? "",
            typographyFont: "subSubTitleLight",
            underline: true,
            onValuePress: async () =>
                await Linking.openURL(activity.linkUrl ?? ""),
        },
        {
            id: 3,
            title: LL.STATUS(),
            value: `${txStatus}`,
            typographyFont: "subSubTitle",
            underline: true,
        },
        {
            id: 4,
            title: LL.ORIGIN(),
            value: activity.linkUrl || "",
            typographyFont: "subSubTitleLight",
            underline: true,
            // TODO(Piero) (https://github.com/vechainfoundation/veworld-mobile/issues/755) onValuePress opens browser or in-app browser
        },
        {
            id: 5,
            title: LL.GAS_FEE(),
            value: `${gasFeeInVTHOHumanReadable} ${VTHO.symbol}`,
            typographyFont: "subSubTitle",
            underline: false,
            valueAdditional: fiatValueGasFeeSpent
                ? `≈ ${fiatValueGasFeeSpent} ${currencySymbolMap[currency]}`
                : "",
        },
        {
            id: 6,
            title: LL.TRANSACTION_ID(),
            value: `${transactionIDshort}`,
            typographyFont: "subSubTitle",
            underline: false,
            icon: "content-copy",
            onValuePress: () =>
                onCopyToClipboard(activity.id, LL.COMMON_LBL_ADDRESS()),
        },
        {
            id: 7,
            title: LL.BLOCK_NUMBER(),
            value: blockNumber ? `${blockNumber}` : "",
            typographyFont: "subSubTitle",
            underline: false,
        },
        {
            id: 8,
            title: LL.TITLE_NETWORK(),
            value: network.toUpperCase(),
            typographyFont: "subSubTitle",
            underline: false,
        },
    ]

    return (
        <>
            {details.map(
                (detail: ActivityDetail, index: number) =>
                    detail.value && (
                        <ActivityDetailItem
                            key={detail.id}
                            activityDetail={detail}
                            border={index !== details.length - 1}
                        />
                    ),
            )}

            <BaseSpacer height={16} />

            {!!clausesMetadata.length && (
                <ClausesCarousel clausesMetadata={clausesMetadata} />
            )}

            <BaseSpacer height={16} />
        </>
    )
})
