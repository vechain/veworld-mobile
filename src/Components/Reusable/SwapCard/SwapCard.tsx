/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { useThemedStyles } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { COLORS, ColorThemeType } from "~Constants"
import { BaseIcon, BaseView } from "~Components"
import { selectCurrencyExchangeRate, useAppSelector } from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { useSwappedTokens } from "./Hooks"
import { TokenBox } from "./Components"

type Props = {
    paidTokenAddress: string
    receivedTokenAddress: string
    paidTokenAmount: string
    receivedTokenAmount: string
    onAddCustomToken: (tokenAddress: string) => void
}

export enum SWAP_SIDE {
    PAID = "PAID",
    RECEIVED = "RECEIVED",
}

export const SwapCard = memo(
    ({
        paidTokenAddress,
        receivedTokenAddress,
        paidTokenAmount,
        receivedTokenAmount,
        onAddCustomToken,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const { paidToken, receivedToken } = useSwappedTokens(
            receivedTokenAddress,
            paidTokenAddress,
        )

        const exchangeRatePaid = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, paidToken),
        )

        const exchangeRateReceived = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, receivedToken),
        )

        const paidTokenAddressShort = useMemo(() => {
            return FormattingUtils.humanAddress(paidTokenAddress, 4, 6)
        }, [paidTokenAddress])

        const receivedTokenAddressShort = useMemo(() => {
            return FormattingUtils.humanAddress(receivedTokenAddress, 4, 6)
        }, [receivedTokenAddress])

        const paidAmount = useMemo(() => {
            return FormattingUtils.humanNumber(
                FormattingUtils.scaleNumberDown(
                    paidTokenAmount,
                    paidToken?.decimals ?? 0,
                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                ),
                paidTokenAmount,
            )
        }, [paidTokenAmount, paidToken])

        const receivedAmount = useMemo(() => {
            return FormattingUtils.humanNumber(
                FormattingUtils.scaleNumberDown(
                    receivedTokenAmount,
                    receivedToken?.decimals ?? 0,
                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                ),
                receivedTokenAmount,
            )
        }, [receivedTokenAmount, receivedToken])

        const fiatValuePaid = useMemo(() => {
            if (exchangeRatePaid?.rate && paidToken)
                return FormattingUtils.humanNumber(
                    FormattingUtils.convertToFiatBalance(
                        paidTokenAmount,
                        exchangeRatePaid.rate,
                        paidToken.decimals,
                    ),
                    paidAmount,
                )
        }, [exchangeRatePaid?.rate, paidAmount, paidToken, paidTokenAmount])

        const fiatValueReceived = useMemo(() => {
            if (exchangeRateReceived?.rate && receivedToken)
                return FormattingUtils.humanNumber(
                    FormattingUtils.convertToFiatBalance(
                        receivedTokenAmount,
                        exchangeRateReceived.rate,
                        receivedToken.decimals,
                    ),
                    receivedAmount,
                )
        }, [
            exchangeRateReceived?.rate,
            receivedAmount,
            receivedToken,
            receivedTokenAmount,
        ])

        const renderPaidToken = useCallback(() => {
            return (
                <TokenBox
                    provenance={SWAP_SIDE.PAID}
                    addressFull={paidTokenAddress}
                    addressShort={paidTokenAddressShort}
                    amount={paidAmount}
                    fiatValue={fiatValuePaid}
                    token={paidToken}
                    onAddCustomToken={onAddCustomToken}
                />
            )
        }, [
            fiatValuePaid,
            onAddCustomToken,
            paidAmount,
            paidToken,
            paidTokenAddress,
            paidTokenAddressShort,
        ])

        const renderReceivedToken = useCallback(() => {
            return (
                <TokenBox
                    provenance={SWAP_SIDE.RECEIVED}
                    addressFull={receivedTokenAddress}
                    addressShort={receivedTokenAddressShort}
                    amount={receivedAmount}
                    fiatValue={fiatValueReceived}
                    token={receivedToken}
                    onAddCustomToken={onAddCustomToken}
                />
            )
        }, [
            fiatValueReceived,
            onAddCustomToken,
            receivedAmount,
            receivedToken,
            receivedTokenAddress,
            receivedTokenAddressShort,
        ])

        return (
            <DropShadow style={[theme.shadows.card, styles.container]}>
                <BaseView bg={theme.colors.card} style={styles.view}>
                    {/* PAID View */}
                    {renderPaidToken()}

                    {/* SEPARATOR */}
                    <BaseView style={styles.separator} />

                    {/* RECEIVED View */}
                    {renderReceivedToken()}

                    {/* ICON */}
                    <BaseIcon
                        style={[styles.icon, { marginTop: -20 }]}
                        name={"swap-horizontal"}
                        color={COLORS.WHITE}
                        size={24}
                        bg={theme.colors.switcher}
                        iconPadding={3}
                    />
                </BaseView>
            </DropShadow>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        view: {
            borderRadius: 16,
        },
        separator: {
            width: "100%",
            borderWidth: 1,
            borderColor: theme.colors.background,
        },
        icon: {
            position: "absolute",
            top: "50%",
            right: 20,
        },
    })
