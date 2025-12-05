import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseView, useSendContext } from "~Components"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { SendContent } from "../Shared"
import { TransactionAlert } from "./Components"
import { TokenReceiverCard } from "./Components/TokenReceiverCard"
import { TransactionFeeCard } from "./Components/TransactionFeeCard"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

export const SummaryScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const navigation = useNavigation<NavigationProps>()
    const { flowState, txError, setTxError } = useSendContext()

    const { token, address } = flowState

    const [hasGasAdjustment, setHasGasAdjustment] = useState(false)

    const handleGasAdjusted = useCallback(() => {
        setHasGasAdjustment(true)
    }, [])

    const handleTxFinished = useCallback(
        (success: boolean) => {
            if (success) {
                if (txError) {
                    setTxError(false)
                }
                navigation.navigate(Routes.HOME)
                return
            }

            if (!txError) {
                setTxError(true)
            }
        },
        [navigation, setTxError, txError],
    )

    if (!token || !address) {
        return <BaseView flex={1} />
    }

    return (
        <SendContent>
            <SendContent.Header />
            <SendContent.Container>
                <Animated.View style={styles.root}>
                    <TokenReceiverCard address={address} />
                    <TransactionFeeCard
                        token={token}
                        amount={flowState.amount!}
                        address={address}
                        onTxFinished={handleTxFinished}
                        onGasAdjusted={handleGasAdjusted}
                    />

                    <TransactionAlert hasGasAdjustment={hasGasAdjustment} txError={txError} />
                </Animated.View>
            </SendContent.Container>
            <SendContent.Footer>
                <SendContent.Footer.Back />
                <SendContent.Footer.Next action={() => {}} />
            </SendContent.Footer>
        </SendContent>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: "column",
            gap: 16,
        },
    })
