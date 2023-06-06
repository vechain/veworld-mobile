/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useMemo } from "react"
import { Image, StyleSheet, ImageStyle } from "react-native"
import DropShadow from "react-native-drop-shadow"
import {
    ColorThemeType,
    SCREEN_WIDTH,
    VET,
    currencySymbolMap,
    useThemedStyles,
} from "~Common"
import { FormattingUtils } from "~Utils"
import { COLORS } from "~Common/Theme"
import { BaseCard, BaseIcon, BaseText, BaseView } from "~Components"
import { Token } from "~Model"
import {
    selectAccountCustomTokens,
    selectCurrency,
    selectCurrencyExchangeRate,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { RootState } from "~Storage/Redux/Types"
import { useSwappedTokens } from "./Hooks"

type Props = {
    paidTokenAddress: string
    receivedTokenAddress: string
    paidTokenAmount: string
    receivedTokenAmount: string
    onAddCustomToken: (tokenAddress: string) => void
}

enum SWAP_SIDE {
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
        const { LL } = useI18nContext()

        const { styles, theme } = useThemedStyles(baseStyles)

        const currency = useAppSelector(selectCurrency)

        const customTokens = useAppSelector(selectAccountCustomTokens)

        const { paidToken, receivedToken, tokens } = useSwappedTokens(
            receivedTokenAddress,
            paidTokenAddress,
        )

        const exchangeRatePaid = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, paidToken?.symbol ?? ""),
        )

        const exchangeRateReceived = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, receivedToken?.symbol ?? ""),
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
            return undefined
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
            return undefined
        }, [
            exchangeRateReceived?.rate,
            receivedAmount,
            receivedToken,
            receivedTokenAmount,
        ])

        const renderToken = useCallback(
            (
                provenance: SWAP_SIDE,
                addressShort: string,
                addressFull: string,
                amount: string,
                fiatValue?: string,
                token?: Token,
            ) => {
                const provenanceText =
                    provenance === SWAP_SIDE.PAID ? LL.PAID() : LL.RECEIVED()

                const isTokenAdded = [...customTokens, ...tokens, VET]
                    .map(tkn => tkn.address.toLowerCase())
                    .includes(addressFull.toLowerCase())

                const tokenIcon = (
                    <DropShadow style={[theme.shadows.card]}>
                        <BaseView flexDirection="column" alignItems="center">
                            {token?.icon ? (
                                <BaseCard
                                    style={[
                                        styles.imageContainer,
                                        { backgroundColor: COLORS.WHITE },
                                    ]}
                                    containerStyle={styles.imageShadow}>
                                    <Image
                                        source={{ uri: token.icon }}
                                        style={styles.tokenIcon as ImageStyle}
                                    />
                                </BaseCard>
                            ) : (
                                <BaseIcon
                                    name="help"
                                    size={22}
                                    color={COLORS.DARK_PURPLE}
                                    bg={COLORS.WHITE}
                                    iconPadding={4}
                                />
                            )}
                        </BaseView>
                    </DropShadow>
                )

                return (
                    <BaseView
                        py={12}
                        px={16}
                        style={{ width: SCREEN_WIDTH - 40 }}
                        alignItems="flex-start">
                        <BaseText typographyFont="buttonPrimary">
                            {provenanceText}
                        </BaseText>
                        <BaseView flexDirection="row" py={8}>
                            {tokenIcon}
                            <BaseView flexDirection="column" pl={12}>
                                {token ? (
                                    <>
                                        <BaseView flexDirection="row">
                                            <BaseText typographyFont="subSubTitle">
                                                {token.name}
                                            </BaseText>
                                            <BaseText typographyFont="subSubTitleLight">
                                                {" ("}
                                                {token.symbol}
                                                {")"}
                                            </BaseText>
                                        </BaseView>
                                        <BaseView pt={3} flexDirection="row">
                                            <BaseText typographyFont="captionRegular">
                                                {amount}
                                            </BaseText>
                                            <BaseText typographyFont="captionRegular">
                                                {" "}
                                                {token.symbol}
                                            </BaseText>
                                            {fiatValue && (
                                                <BaseText typographyFont="captionRegular">
                                                    {" ≈ "}
                                                    {fiatValue}{" "}
                                                    {
                                                        currencySymbolMap[
                                                            currency
                                                        ]
                                                    }
                                                </BaseText>
                                            )}
                                        </BaseView>
                                    </>
                                ) : (
                                    <BaseText typographyFont="button">
                                        {addressShort}
                                    </BaseText>
                                )}
                            </BaseView>
                            {!isTokenAdded && (
                                <BaseView pl={12}>
                                    <BaseIcon
                                        name={"plus"}
                                        size={20}
                                        bg={COLORS.LIME_GREEN}
                                        iconPadding={3}
                                        color={COLORS.DARK_PURPLE}
                                        action={() =>
                                            onAddCustomToken(addressFull)
                                        }
                                    />
                                </BaseView>
                            )}
                        </BaseView>
                    </BaseView>
                )
            },
            [
                LL,
                currency,
                customTokens,
                onAddCustomToken,
                styles.imageContainer,
                styles.imageShadow,
                styles.tokenIcon,
                theme.shadows.card,
                tokens,
            ],
        )

        const renderPaidToken = useCallback(() => {
            return renderToken(
                SWAP_SIDE.PAID,
                paidTokenAddressShort,
                paidTokenAddress,
                paidAmount,
                fiatValuePaid,
                paidToken,
            )
        }, [
            fiatValuePaid,
            paidAmount,
            paidToken,
            paidTokenAddress,
            paidTokenAddressShort,
            renderToken,
        ])

        const renderReceivedToken = useCallback(() => {
            return renderToken(
                SWAP_SIDE.RECEIVED,
                receivedTokenAddressShort,
                receivedTokenAddress,
                receivedAmount,
                fiatValueReceived,
                receivedToken,
            )
        }, [
            fiatValueReceived,
            receivedAmount,
            receivedToken,
            receivedTokenAddress,
            receivedTokenAddressShort,
            renderToken,
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
        tokenIcon: {
            width: 20,
            height: 20,
        },
        imageContainer: {
            borderRadius: 30,
            padding: 10,
        },
        imageShadow: {
            width: "auto",
        },
    })
