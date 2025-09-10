import React from "react"
import { StyleSheet } from "react-native"
import { FiatBalance } from "~Components"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { WalletAccount } from "~Model"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
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
    const { data: vot3RawBalance } = useTokenBalance({
        address: account.address,
        tokenAddress: VOT3.address,
    })

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        b3trWithInfo.exchangeRate ?? 0,
        VOT3.decimals,
    )

    const nonVechainTokens = useNonVechainTokenFiat({ accountAddress: account.address })

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
