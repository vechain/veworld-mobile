import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useMemo } from "react"
import { LEDGER_ERROR_CODES } from "~Common/Ledger"
import { BaseBottomSheet, BaseSpacer, BaseText } from "~Components"
import { useI18nContext } from "~i18n"
import Lottie from "lottie-react-native"
import { BlePairingDark, EnterPinCodeDark, OpenAppDark } from "~Assets/Lottie"
import { StyleSheet } from "react-native"

/**
 * error: LEDGER_ERROR_CODES - the error code to display the message for
 *
 */
type Props = {
    error?: LEDGER_ERROR_CODES
    onDismiss?: () => void
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
>(({ error, onDismiss }, ref) => {
    const { LL } = useI18nContext()

    const data: DataToDisplay = useMemo(() => {
        switch (error) {
            case LEDGER_ERROR_CODES.OFF_OR_LOCKED:
                return {
                    title: LL.WALLET_LEDGER_ERROR_UNLOCK_LEDGER(),
                    desc: LL.WALLET_LEDGER_ERROR_UNLOCK_LEDGER_DESC(),
                    image: (
                        <Lottie
                            source={EnterPinCodeDark}
                            autoPlay
                            style={styles.lottie}
                        />
                    ),
                }
            case LEDGER_ERROR_CODES.NO_VET_APP:
                return {
                    title: LL.WALLET_LEDGER_ERROR_OPEN_APP(),
                    desc: LL.WALLET_LEDGER_ERROR_OPEN_APP_DESC(),
                    image: (
                        <Lottie
                            source={OpenAppDark}
                            autoPlay
                            style={styles.lottie}
                        />
                    ),
                }
            case LEDGER_ERROR_CODES.UNKNOWN:
                return {
                    title: LL.WALLET_LEDGER_ERROR_UNKNOWN(),
                    desc: LL.WALLET_LEDGER_ERROR_UNKNOWN_DESC(),
                    image: (
                        <Lottie
                            source={BlePairingDark}
                            autoPlay
                            style={styles.lottie}
                        />
                    ),
                }
            default:
                return {
                    title: LL.WALLET_LEDGER_ERROR_UNKNOWN(),
                    desc: LL.WALLET_LEDGER_ERROR_UNKNOWN_DESC(),
                    image: (
                        <Lottie
                            source={BlePairingDark}
                            autoPlay
                            style={styles.lottie}
                        />
                    ),
                }
        }
    }, [error, LL])

    if (!error) return <></>

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onDismiss={onDismiss}
            ref={ref}>
            <BaseText typographyFont="subTitleBold">{data.title}</BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="body">{data.desc}</BaseText>
            <BaseSpacer height={24} />
            {data.image}
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    lottie: {
        width: "100%",
        height: 100,
    },
})
