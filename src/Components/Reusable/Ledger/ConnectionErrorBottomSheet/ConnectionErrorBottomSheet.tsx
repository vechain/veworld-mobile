import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useMemo } from "react"
import { LEDGER_ERROR_CODES } from "~Constants"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import Lottie from "lottie-react-native"
import { BlePairingDark, EnterPinCodeDark, OpenAppDark, ValidateDark } from "~Assets/Lottie"
import { ActivityIndicator, StyleSheet } from "react-native"
import { useTheme } from "~Hooks"

/**
 * error: LEDGER_ERROR_CODES - the error code to display the message for
 *
 */
type Props = {
    error?: LEDGER_ERROR_CODES
    onDismiss?: () => void
    onRetry?: () => void
}

type DataToDisplay = {
    title: string
    desc: string
    image: React.ReactNode
    retry?: boolean
}

// component to select an account
export const ConnectionErrorBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ error, onDismiss, onRetry }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        const data: DataToDisplay = useMemo(() => {
            switch (error) {
                case LEDGER_ERROR_CODES.DEVICE_NOT_FOUND:
                case LEDGER_ERROR_CODES.OFF_OR_LOCKED:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_UNLOCK_LEDGER(),
                        desc: LL.WALLET_LEDGER_ERROR_UNLOCK_LEDGER_DESC(),
                        image: <Lottie source={EnterPinCodeDark} autoPlay style={styles.lottie} />,
                        retry: true,
                    }
                case LEDGER_ERROR_CODES.NO_VET_APP:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_OPEN_APP(),
                        desc: LL.WALLET_LEDGER_ERROR_OPEN_APP_DESC(),
                        image: <Lottie source={OpenAppDark} autoPlay style={styles.lottie} />,
                    }
                case LEDGER_ERROR_CODES.CONNECTING:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_CONNECTING(),
                        desc: LL.WALLET_LEDGER_ERROR_CONNECTING_DESC(),
                        image: <Lottie source={OpenAppDark} autoPlay style={styles.lottie} />,
                    }
                case LEDGER_ERROR_CODES.WAITING_SIGNATURE:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_VALIDATE_SIGNATURE(),
                        desc: LL.WALLET_LEDGER_ERROR_VALIDATE_SIGNATURE_DESC(),
                        image: <Lottie source={ValidateDark} autoPlay style={styles.lottie} />,
                    }
                case LEDGER_ERROR_CODES.CONTRACT_AND_CLAUSES_DISABLED:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_CLAUSES_AND_CONTRACT_DATA_DISABLED(),
                        desc: LL.WALLET_LEDGER_ERROR_CLAUSES_AND_CONTRACT_DATA_DISABLED_DESC(),
                        image: <Lottie source={OpenAppDark} autoPlay style={styles.lottie} />,
                        retry: true,
                    }
                case LEDGER_ERROR_CODES.CONTRACT_DISABLED:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_CONTRACT_DATA_DISABLED(),
                        desc: LL.WALLET_LEDGER_ERROR_CONTRACT_DATA_DISABLED_DESC(),
                        image: <Lottie source={OpenAppDark} autoPlay style={styles.lottie} />,
                        retry: true,
                    }
                case LEDGER_ERROR_CODES.CLAUSES_DISABLED:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_CLAUSES_DISABLED(),
                        desc: LL.WALLET_LEDGER_ERROR_CLAUSES_DISABLED_DESC(),
                        image: <Lottie source={OpenAppDark} autoPlay style={styles.lottie} />,
                        retry: true,
                    }
                case LEDGER_ERROR_CODES.UNKNOWN:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_UNKNOWN(),
                        desc: LL.WALLET_LEDGER_ERROR_UNKNOWN_DESC(),
                        image: <Lottie source={BlePairingDark} autoPlay style={styles.lottie} />,
                        retry: true,
                    }
                default:
                    return {
                        title: LL.WALLET_LEDGER_ERROR_UNKNOWN(),
                        desc: LL.WALLET_LEDGER_ERROR_UNKNOWN_DESC(),
                        image: <Lottie source={BlePairingDark} autoPlay style={styles.lottie} />,
                    }
            }
        }, [error, LL])

        if (!error) return <></>

        return (
            <BaseBottomSheet dynamicHeight onDismiss={onDismiss} ref={ref}>
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                    <BaseText typographyFont="subTitleBold">{data.title}</BaseText>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </BaseView>
                <BaseSpacer height={16} />
                <BaseText typographyFont="body">{data.desc}</BaseText>
                <BaseSpacer height={72} />
                {data.image}
                {data.retry && onRetry && (
                    <>
                        <BaseSpacer height={8} />
                        <BaseButton title={LL.BTN_RETRY()} action={onRetry} />
                        <BaseSpacer height={8} />
                    </>
                )}
            </BaseBottomSheet>
        )
    },
)

const styles = StyleSheet.create({
    lottie: {
        width: "100%",
        height: 100,
    },
})
