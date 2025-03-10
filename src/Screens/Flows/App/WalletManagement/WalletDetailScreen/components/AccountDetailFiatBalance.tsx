import React from "react"
import { FiatBalance } from "~Components"
import { WalletAccount } from "~Model"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { StyleSheet } from "react-native"
import { selectBalanceForTokenByAccount, selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

type Props = {
    account: WalletAccount
    isVisible: boolean
    isLoading: boolean
}

export const AccountDetailFiatBalance: React.FC<Props> = ({ account, isVisible, isLoading }) => {
    const { styles } = useThemedStyles(baseStyles)
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))

    const vetWithInfo = useTokenWithCompleteInfo(VET, account.address)
    const vthoWithInfo = useTokenWithCompleteInfo(VTHO, account.address)
    const b3trWithInfo = useTokenWithCompleteInfo(B3TR, account.address)
    const vot3RawBalance = useAppSelector(state => selectBalanceForTokenByAccount(state, VOT3.address, account.address))

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        b3trWithInfo.exchangeRate ?? 0,
        VOT3.decimals,
    )

    const nonVechainTokens = useNonVechainTokenFiat(account.address)

    return (
        <FiatBalance
            balances={[
                vetWithInfo.fiatBalance,
                vthoWithInfo.fiatBalance,
                b3trWithInfo.fiatBalance,
                vot3FiatBalance,
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
