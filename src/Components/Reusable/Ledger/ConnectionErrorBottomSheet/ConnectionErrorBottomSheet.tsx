import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useMemo } from "react"
import { LEDGER_ERROR_CODES } from "~Utils/LedgerUtils/LedgerUtils"
import { BaseBottomSheet, BaseSpacer, BaseText } from "~Components"
import { useI18nContext } from "~i18n"

/**
 * error: LEDGER_ERROR_CODES - the error code to display the message for
 *
 */
type Props = {
    error?: LEDGER_ERROR_CODES
}

const snapPoints = ["50%"]

type DataToDisplay = {
    title: string
    desc: string
    image: React.ReactNode
}

// component to select an account
export const ConnectionErrorBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ error }, ref) => {
    const { LL } = useI18nContext()

    const data: DataToDisplay = useMemo(() => {
        switch (error) {
            case LEDGER_ERROR_CODES.OFF_OR_LOCKED:
                return {
                    title: LL.WALLET_LEDGER_ERROR_UNLOCK_LEDGER(),
                    desc: LL.WALLET_LEDGER_ERROR_UNLOCK_LEDGER_DESC(),
                    image: <></>,
                }
            case LEDGER_ERROR_CODES.NO_VET_APP:
                return {
                    title: LL.WALLET_LEDGER_ERROR_OPEN_APP(),
                    desc: LL.WALLET_LEDGER_ERROR_OPEN_APP_DESC(),
                    image: <></>,
                }
            case LEDGER_ERROR_CODES.UNKNOWN:
                return {
                    title: LL.WALLET_LEDGER_ERROR_UNKNOWN(),
                    desc: LL.WALLET_LEDGER_ERROR_UNKNOWN_DESC(),
                    image: <></>,
                }
            default:
                return {
                    title: LL.WALLET_LEDGER_ERROR_UNKNOWN(),
                    desc: LL.WALLET_LEDGER_ERROR_UNKNOWN_DESC(),
                    image: <></>,
                }
        }
    }, [error, LL])

    if (!error) return <></>

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseText typographyFont="subTitleBold">{data.title}</BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="body">{data.desc}</BaseText>
            <BaseSpacer height={24} />
        </BaseBottomSheet>
    )
})
