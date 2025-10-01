import React, { memo, useMemo } from "react"
import { Linking } from "react-native"
import { BaseSpacer } from "~Components"
import { VTHO, genesisesId } from "~Constants"
import { useCopyClipboard } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ActivityStatus, DappTxActivity } from "~Model"
import { selectOfficialTokens, useAppSelector } from "~Storage/Redux"
import { AddressUtils, TransactionUtils } from "~Utils"
import { useGasFee } from "../../Hooks"
import { ActivityDetail } from "../../Type"
import { ActivityDetailItem } from "../ActivityDetailItem"
import { ClausesCarousel } from "./ClausesCarousel"

type Props = {
    activity: DappTxActivity
    clauses?: Connex.VM.Clause[]
    status?: ActivityStatus
    paid: string | undefined
    isLoading?: boolean
}

export const DappTransactionDetails: React.FC<Props> = memo(
    ({ activity, clauses, status, paid, isLoading = false }) => {
        const { LL } = useI18nContext()

        const network = useMemo(() => {
            return activity.genesisId === genesisesId.main ? LL.NETWORK_LABEL_MAINNET() : LL.NETWORK_LABEL_TESTNET()
        }, [LL, activity.genesisId])

        const { vthoGasFee, fiatValueGasFeeSpent } = useGasFee(paid)

        const tokens = useAppSelector(selectOfficialTokens)

        const clausesMetadata = TransactionUtils.interpretClauses(clauses ?? [], tokens)

        const transactionIDshort = useMemo(() => {
            return AddressUtils.humanAddress(activity.txId ?? "", 7, 9)
        }, [activity.txId])

        const txStatus = useMemo(() => {
            switch (status) {
                case ActivityStatus.PENDING:
                    return LL.ACTIVITIES_STATUS_pending()
                case ActivityStatus.REVERTED:
                    return activity.blockNumber ? LL.ACTIVITIES_STATUS_reverted() : LL.ACTIVITIES_STATUS_failed()
                case ActivityStatus.SUCCESS:
                    return LL.ACTIVITIES_STATUS_success()
            }
        }, [LL, status, activity.blockNumber])

        const { onCopyToClipboard } = useCopyClipboard()

        const blockNumber = useMemo(() => {
            return activity.blockNumber
        }, [activity.blockNumber])

        const baseDetails: ActivityDetail[] = [
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
                onValuePress: async () => await Linking.openURL(activity.linkUrl ?? ""),
            },
            {
                id: 3,
                title: LL.STATUS(),
                value: `${txStatus}`,
                typographyFont: "subSubTitle",
                underline: true,
                isLoading: isLoading,
            },
        ]

        const transactionIdDetail: ActivityDetail[] = [
            {
                id: 5,
                title: LL.GAS_FEE(),
                value: `${vthoGasFee} ${VTHO.symbol}`,
                typographyFont: "subSubTitle",
                underline: false,
                valueAdditional: fiatValueGasFeeSpent ?? "",
                isLoading: isLoading,
            },
            {
                id: 6,
                title: LL.TRANSACTION_ID(),
                value: `${transactionIDshort}`,
                typographyFont: "subSubTitle",
                underline: false,
                icon: activity.txId ? "icon-copy" : undefined,
                onValuePress: () => {
                    if (activity.txId) onCopyToClipboard(activity.txId, LL.TRANSACTION_ID())
                },
            },
        ]

        const endDetails: ActivityDetail[] = [
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

        const details = activity.blockNumber
            ? [...baseDetails, ...transactionIdDetail, ...endDetails]
            : [...baseDetails, ...endDetails]

        return (
            <>
                {details.map(
                    (detail: ActivityDetail, index: number) =>
                        detail.value && (
                            <ActivityDetailItem
                                key={detail.id}
                                activityDetail={detail}
                                border={index !== details.length - 1}
                                isLoading={detail.isLoading}
                            />
                        ),
                )}

                <BaseSpacer height={16} />

                {!!clausesMetadata.length && <ClausesCarousel clausesMetadata={clausesMetadata} />}

                <BaseSpacer height={16} />
            </>
        )
    },
)
