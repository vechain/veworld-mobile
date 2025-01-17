import React from "react"
import { FiatBalance } from "~Components"
import { WalletAccount } from "~Model"
import { VET, VTHO, B3TR } from "~Constants"
import { useNonVechainTokenFiat, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { StyleSheet } from "react-native"

type Props = {
    account: WalletAccount
    isVisible: boolean
    isLoading: boolean
}

export const AccountDetailFiatBalance: React.FC<Props> = ({ account, isVisible, isLoading }) => {
    const { styles } = useThemedStyles(baseStyles)

    const vetWithInfo = useTokenWithCompleteInfo(VET, account.address)
    const vthoWithInfo = useTokenWithCompleteInfo(VTHO, account.address)
    const b3trWithInfo = useTokenWithCompleteInfo(B3TR, account.address)
    const nonVechainTokens = useNonVechainTokenFiat(account.address)

    return (
        <FiatBalance
            balances={[
                vetWithInfo.fiatBalance,
                vthoWithInfo.fiatBalance,
                b3trWithInfo.fiatBalance,
                ...nonVechainTokens,
            ]}
            isVisible={isVisible}
            isLoading={isLoading}
            style={styles.balance}
            typographyFont="captionRegular"
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        balance: {
            opacity: 0.7,
        },
    })
