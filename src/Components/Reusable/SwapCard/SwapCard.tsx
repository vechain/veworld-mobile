/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { useExchangeRate } from "~Api/Coingecko"
import { BaseIcon, BaseView } from "~Components"
import { COLORS, ColorThemeType, getCoinGeckoIdBySymbol } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { TokenBox } from "./Components"
import { useSwappedTokens } from "./Hooks"

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
    ({ paidTokenAddress, receivedTokenAddress, paidTokenAmount, receivedTokenAmount, onAddCustomToken }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const { paidToken, receivedToken } = useSwappedTokens(receivedTokenAddress, paidTokenAddress)

        const currency = useAppSelector(selectCurrency)

        const { data: exchangeRateReceived } = useExchangeRate({
            id: getCoinGeckoIdBySymbol[receivedToken?.symbol ?? ""],
            vs_currency: currency,
        })

        const { data: exchangeRatePaid } = useExchangeRate({
            id: getCoinGeckoIdBySymbol[paidToken?.symbol ?? ""],
            vs_currency: currency,
        })

        const paidTokenAddressShort = useMemo(() => {
            return AddressUtils.humanAddress(paidTokenAddress)
        }, [paidTokenAddress])

        const receivedTokenAddressShort = useMemo(() => {
            return AddressUtils.humanAddress(receivedTokenAddress)
        }, [receivedTokenAddress])

        const paidAmount = useMemo(
            () =>
                BigNutils(paidTokenAmount)
                    .toHuman(paidToken?.decimals ?? 0)
                    .toTokenFormat_string(2),
            [paidTokenAmount, paidToken],
        )

        const receivedAmount = useMemo(
            () =>
                BigNutils(receivedTokenAmount)
                    .toHuman(receivedToken?.decimals ?? 0)
                    .toTokenFormat_string(2),

            [receivedTokenAmount, receivedToken],
        )

        const fiatValuePaid = useMemo(() => {
            if (exchangeRatePaid && paidToken) {
                const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(paidAmount, exchangeRatePaid)
                return isLeesThan_0_01 ? `< ${value}` : value
            }
        }, [exchangeRatePaid, paidAmount, paidToken])

        const fiatValueReceived = useMemo(() => {
            if (exchangeRateReceived && receivedToken) {
                const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(
                    receivedAmount,
                    exchangeRateReceived,
                )
                return isLeesThan_0_01 ? `< ${value}` : value
            }
        }, [exchangeRateReceived, receivedAmount, receivedToken])

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
        }, [fiatValuePaid, onAddCustomToken, paidAmount, paidToken, paidTokenAddress, paidTokenAddressShort])

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
                        name="icon-arrow-left-right"
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
