import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { COLORS, VET } from "~Constants"
import { useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import BigNumber from "bignumber.js"
import {
    selectIsTokensOwnedLoading,
    selectVetTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { WalletAccount } from "~Model"
import SkeletonContent from "react-native-skeleton-content-nonexpo"

type Props = {
    isVisible: boolean
    toggleVisible: () => void
    account: WalletAccount
}

export const Balance: React.FC<Props> = memo(
    ({ isVisible, toggleVisible, account }) => {
        const theme = useTheme()
        const { LL } = useI18nContext()

        const vetTokenWithBalance = useAppSelector(state =>
            selectVetTokenWithBalanceByAccount(state, account.address),
        )

        const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

        const balance = new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetTokenWithBalance?.balance.balance || "0",
                1,
                VET.decimals,
            ),
        ).toString()

        const renderBalance = useMemo(() => {
            if (isVisible) return FormattingUtils.humanNumber(balance, balance)
            return Array.from(
                Array(FormattingUtils.humanNumber(balance).length).keys(),
            ).map(_value => "•")
        }, [balance, isVisible])

        return (
            <>
                <BaseView flexDirection="row">
                    <BaseText
                        color={theme.colors.textReversed}
                        typographyFont="body">
                        {LL.BD_YOUR_BALANCE()}
                    </BaseText>
                    <BaseIcon
                        action={toggleVisible}
                        haptics="Light"
                        name={isVisible ? "eye-off" : "eye"}
                        color={theme.colors.textReversed}
                        size={18}
                        style={baseStyles.marginLeft}
                    />
                </BaseView>
                <BaseView flexDirection="row" alignItems="baseline">
                    {isTokensOwnedLoading ? (
                        <BaseView pt={4}>
                            <SkeletonContent
                                containerStyle={baseStyles.skeleton}
                                animationDirection="horizontalLeft"
                                boneColor={
                                    theme.isDark
                                        ? COLORS.LIME_GREEN
                                        : COLORS.DARK_PURPLE
                                }
                                highlightColor={COLORS.LIGHT_PURPLE}
                                layout={[
                                    {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        children: [
                                            // Line
                                            {
                                                width: "100%",
                                                height: 45,
                                            },
                                        ],
                                    },
                                ]}
                                isLoading={true}
                            />
                        </BaseView>
                    ) : (
                        <BaseText
                            color={theme.colors.textReversed}
                            typographyFont="hugeTitle">
                            {renderBalance}
                        </BaseText>
                    )}

                    <BaseText
                        mx={4}
                        color={theme.colors.textReversed}
                        typographyFont="body">
                        {VET.symbol}
                    </BaseText>
                </BaseView>
            </>
        )
    },
)

const baseStyles = StyleSheet.create({
    marginLeft: {
        marginLeft: 8,
    },
    skeleton: {
        width: 140,
    },
})
