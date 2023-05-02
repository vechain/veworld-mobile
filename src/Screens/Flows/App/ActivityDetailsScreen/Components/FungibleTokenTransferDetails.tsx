import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import {
    ColorThemeType,
    FormattingUtils,
    GasUtils,
    VTHO,
    currencySymbolMap,
    useTheme,
    useThemedStyles,
    warn,
} from "~Common"
import { DEFAULT_GAS_COEFFICIENT } from "~Common/Constant/Thor/ThorConstants"
import {
    BaseIcon,
    BaseText,
    BaseTouchable,
    BaseView,
    useThor,
} from "~Components"
import { FungibleToken, FungibleTokenActivity } from "~Model"
import {
    selectCurrency,
    selectCurrencyExchangeRate,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { useI18nContext } from "~i18n"
import BigNumber from "bignumber.js"
import { Alert, StyleSheet } from "react-native"
import * as Clipboard from "expo-clipboard"

type Props = {
    activity: FungibleTokenActivity
    token?: FungibleToken
}

type FungibleTokenDetail = {
    id: number
    title: string
    value: string
    valueAdditional?: string
    icon?: string
    onValuePress?: () => void
}

export const FungibleTokenTransferDetails: React.FC<Props> = memo(
    ({ activity, token }) => {
        const { LL } = useI18nContext()

        const thor = useThor()

        const theme = useTheme()

        const network = useAppSelector(selectSelectedNetwork)

        const currency = useAppSelector(selectCurrency)

        const { styles } = useThemedStyles(baseStyles)

        const [gasFeeInVTHO, setFeeInVTHO] = useState<BigNumber>()

        /**
         * Calculate the fee spent for the transaction in VTHO units (same as wei in Ethereum)
         */
        useEffect(() => {
            if (activity.txReceipt) {
                const gasBn = new BigNumber(activity.txReceipt.gasUsed)
                GasUtils.calculateFee(thor, gasBn, DEFAULT_GAS_COEFFICIENT)
                    .then(res => {
                        setFeeInVTHO(res)
                    })
                    .catch(err => {
                        warn(err)
                    })
            }
        }, [activity.txReceipt, thor])

        const amountTransferred = useMemo(() => {
            return FormattingUtils.humanNumber(
                FormattingUtils.scaleNumberDown(
                    activity.amount,
                    token?.decimals ?? 0,
                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                ),
                activity.amount,
            )
        }, [activity.amount, token?.decimals])

        const exchangeRate = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, token?.symbol ?? ""),
        )

        const VTHOexchangeRate = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, VTHO.symbol),
        )

        // Converts gas fee in wei to VTHO
        const gasFeeInVTHOHumanReadable = useMemo(() => {
            return FormattingUtils.scaleNumberDown(
                gasFeeInVTHO ?? 0,
                VTHO.decimals,
                FormattingUtils.ROUND_DECIMAL_DEFAULT,
            )
        }, [gasFeeInVTHO])

        const fiatValueTransferred = useMemo(() => {
            return FormattingUtils.humanNumber(
                FormattingUtils.convertToFiatBalance(
                    activity.amount as string,
                    exchangeRate?.rate ?? 0,
                    token?.decimals ?? 0,
                ),
                activity.amount,
            )
        }, [activity.amount, exchangeRate?.rate, token?.decimals])

        const fiatValueGasFeeSpent = useMemo(() => {
            return FormattingUtils.humanNumber(
                FormattingUtils.convertToFiatBalance(
                    gasFeeInVTHOHumanReadable,
                    VTHOexchangeRate?.rate ?? 0,
                    token?.decimals ?? 0,
                ),
                activity.amount,
            )
        }, [
            VTHOexchangeRate?.rate,
            activity.amount,
            gasFeeInVTHOHumanReadable,
            token?.decimals,
        ])

        const transactionIDshort = useMemo(() => {
            return FormattingUtils.humanAddress(activity.id, 7, 9)
        }, [activity.id])

        const blockNumber = useMemo(() => {
            return activity.txReceipt?.meta.blockNumber
        }, [activity.txReceipt?.meta.blockNumber])

        // Details List
        const details: Array<FungibleTokenDetail> = [
            {
                id: 1,
                title: LL.VALUE_TITLE(),
                value: `${amountTransferred} ${token?.symbol}`,
                valueAdditional: `≈ ${fiatValueTransferred} ${currencySymbolMap[currency]}`,
            },
            {
                id: 2,
                title: LL.GAS_FEE(),
                value: `${gasFeeInVTHOHumanReadable} VTHO`,
                valueAdditional: fiatValueGasFeeSpent
                    ? `≈ ${fiatValueGasFeeSpent} ${currencySymbolMap[currency]}`
                    : "",
            },
            {
                id: 3,
                title: LL.TRANSACTION_ID(),
                value: `${transactionIDshort}`,
                icon: "copy",
                onValuePress: () => onCopyToClipboard(activity.id),
            },
            {
                id: 4,
                title: LL.BLOCK_NUMBER(),
                value: `${blockNumber}`,
            },
            {
                id: 5,
                title: LL.TITLE_NETWORK(),
                value: network.name.toUpperCase(),
            },
        ]

        const onCopyToClipboard = useCallback(
            async (text: string) => {
                await Clipboard.setStringAsync(text)
                Alert.alert(
                    LL.COMMON_LBL_SUCCESS(),
                    LL.NOTIFICATION_COPIED_CLIPBOARD({
                        name: LL.COMMON_LBL_ADDRESS(),
                    }),
                )
            },
            [LL],
        )

        return (
            <>
                {details.map((detail: FungibleTokenDetail) => (
                    <BaseView
                        key={detail.id}
                        w={100}
                        flexDirection="row"
                        style={styles.container}
                        justifyContent="flex-start">
                        <BaseView>
                            <BaseText typographyFont="body" pb={5}>
                                {detail.title}
                            </BaseText>

                            <BaseTouchable
                                action={
                                    detail.onValuePress
                                        ? detail.onValuePress
                                        : () => {}
                                }
                                disabled={!detail.onValuePress}
                                style={styles.valueContainer}>
                                <BaseText typographyFont="subSubTitle">
                                    {detail.value}
                                </BaseText>

                                {detail.valueAdditional && (
                                    <BaseText typographyFont="captionRegular">
                                        {" "}
                                        {detail.valueAdditional}
                                    </BaseText>
                                )}
                                {detail.icon && (
                                    <BaseView pl={3}>
                                        <BaseIcon
                                            name="content-copy"
                                            size={12}
                                            color={theme.colors.text}
                                        />
                                    </BaseView>
                                )}
                            </BaseTouchable>
                        </BaseView>
                    </BaseView>
                ))}
            </>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
            height: 65,
        },
        valueContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
    })
