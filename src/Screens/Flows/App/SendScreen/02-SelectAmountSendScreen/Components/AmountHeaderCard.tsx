import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { useI18nContext } from "~i18n"
import { BigNumber } from "bignumber.js"

export const AmountHeaderCard = ({
    totalBalance,
    token,
    isError,
}: {
    totalBalance: BigNumber
    token: FungibleTokenWithBalance
    isError: boolean
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <>
            <BaseText typographyFont="button">{LL.SEND_CURRENT_BALANCE()}</BaseText>
            <BaseSpacer height={8} />
            <BaseView flexDirection="row" alignItems="baseline" w={100} style={styles.budget}>
                <BaseText typographyFont="subTitleBold">{totalBalance.toString()}</BaseText>
                <BaseSpacer width={5} />
                <BaseText typographyFont="buttonSecondary">{token.symbol}</BaseText>

                {isError && (
                    <BaseView mx={8}>
                        <BaseView flexDirection="row" alignItems="baseline">
                            <BaseIcon name={"alert-circle-outline"} size={20} color={theme.colors.danger} />
                            <BaseSpacer width={8} />
                            <BaseText typographyFont="body" fontSize={12} color={theme.colors.danger}>
                                {LL.SEND_INSUFFICIENT_BALANCE()}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                )}
            </BaseView>
        </>
    )
}

const styles = StyleSheet.create({
    budget: {
        justifyContent: "flex-start",
    },
})
