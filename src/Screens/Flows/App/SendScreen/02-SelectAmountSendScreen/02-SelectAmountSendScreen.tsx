import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useState } from "react"
import { KeyboardAvoidingView } from "react-native"
import { useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { BaseSpacer, BaseView, DismissKeyboardView, FadeoutButton, Layout } from "~Components"
import { RootStackParamListDiscover, RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, ColorThemeType } from "~Constants"
import { selectCurrency, selectCurrencyExchangeRate, useAppSelector } from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useNavigation } from "@react-navigation/native"
import { throttle } from "lodash"
import { CurrencyExchangeRate, FungibleTokenWithBalance } from "~Model"
import { AmountHeaderCard, AmountInputCard, AmountSliderCard } from "./Components"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_AMOUNT_SEND
>

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { initialRoute, token } = route.params

    const theme = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const exchangeRate = useAppSelector(state => selectCurrencyExchangeRate(state, token))
    const isExchangeRateAvailable = !!exchangeRate?.rate
    const currency = useAppSelector(selectCurrency)

    const [input, setInput] = useState(new BigNumber(0))
    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)

    const totalBalance = useMemo(() => new BigNumber(token.balance.balance), [token])
    const totalBalanceInFiat = useMemo(
        () =>
            new BigNumber(
                FormattingUtils.convertToFiatBalance(totalBalance || "0", exchangeRate?.rate || 1, 0),
            ),
        [totalBalance, exchangeRate?.rate],
    )

    // ~ {"totalBalance": "46800000000000000000", "totalBalanceInFiat": "1025933752901595564"}
    // eslint-disable-next-line no-console
    console.log({ totalBalanceInFiat, totalBalance })

    const { percentage } = getPercentage(totalBalance, isInputInFiat, input, totalBalanceInFiat)

    const checkIsInputAmountValid = useCallback(
        (newValue: string) => {
            if (new BigNumber(newValue).gt(totalBalance)) {
                setIsError(true)
            } else {
                setIsError(false)
            }
            setInput(new BigNumber(newValue))
        },
        [totalBalance, setInput],
    )

    const { throttleOnChangePercentage } = useCalculatePercentage({
        totalBalance,
        checkIsInputAmountValid,
        isInputInFiat,
        exchangeRate,
    })

    const handleToggleInputInFiat = useCallback(() => {
        checkIsInputAmountValid(input.toString())
        setIsInputInFiat(s => !s)
    }, [checkIsInputAmountValid, input])

    const { inputColor, placeholderColor, shortenedTokenName } = getUI({
        theme,
        isError,
        token,
    })

    const navigateToNextStep = useCallback(() => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? input : input,
            initialRoute: initialRoute ?? "",
        })
    }, [initialRoute, input, isInputInFiat, nav, token])

    return (
        <Layout
            safeAreaTestID="Select_Amount_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <DismissKeyboardView>
                    <KeyboardAvoidingView behavior="padding">
                        <BaseView>
                            <AmountHeaderCard totalBalance={totalBalance} token={token} isError={isError} />

                            <BaseSpacer height={16} />

                            <AmountInputCard
                                isInputInFiat={isInputInFiat}
                                currency={currency}
                                shortenedTokenName={shortenedTokenName}
                                token={token}
                                inputColor={inputColor}
                                placeholderColor={placeholderColor}
                                input={input}
                                handleChangeInput={checkIsInputAmountValid}
                                isExchangeRateAvailable={isExchangeRateAvailable}
                                handleToggleInputInFiat={handleToggleInputInFiat}
                                exchangeRate={exchangeRate}
                            />

                            <BaseSpacer height={16} />

                            <AmountSliderCard
                                percentage={percentage}
                                throttleOnChangePercentage={throttleOnChangePercentage}
                            />
                        </BaseView>
                    </KeyboardAvoidingView>
                </DismissKeyboardView>
            }
            footer={
                <FadeoutButton
                    title={LL.COMMON_BTN_NEXT()}
                    disabled={isError || input.isNaN() || input.isZero()}
                    action={navigateToNextStep}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

// ~ HELPERS
//
const getUI = ({
    theme,
    isError,
    token,
}: {
    theme: ColorThemeType
    isError: boolean
    token: FungibleTokenWithBalance
}) => {
    const inputColor = isError ? theme.colors.danger : theme.colors.text
    const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED
    const shortenedTokenName = token.name.length > 30 ? `${token.name.slice(0, 29)}...` : token.name
    return { inputColor, placeholderColor, shortenedTokenName }
}

// const getFiatBalances = (
//     input: BigNumber,
//     totalBalance: BigNumber,
//     exchangeRate: CurrencyExchangeRate | undefined,
// ) => {
//     const humanFiatInput = FormattingUtils.humanNumber(
//         FormattingUtils.convertToFiatBalance(input || "0", exchangeRate?.rate ?? 1, 0),
//         input || "0",
//     )

//     const totalBalanceInFiat = FormattingUtils.convertToFiatBalance(
//         totalBalance || "0",
//         exchangeRate?.rate || 1,
//         0,
//     )

//     return { humanFiatInput, totalBalanceInFiat }
// }

// const getTokeBalances = ({
//     input,
//     exchangeRate,
//     totalBalance,
// }: {
//     input: BigNumber
//     exchangeRate: CurrencyExchangeRate | undefined
//     totalBalance: BigNumber
// }) => {
//     /*
//         This one displays the human readable amount of tokens selected by the user both from the slider and the/or the input
//         NOTE - They don't display the fiat amount (correctly)
//         It is used for the small print under the input (to give the user the info on what he is sending relative to the selected token/fiat)
//     */
//     const inputBasedOnSlectectAmount = FormattingUtils.convertToFiatBalance(
//         input || "0",
//         1 / (exchangeRate?.rate ?? 1),
//         0,
//     )

//     const humanTokenInputBasedOnSlectectAmount = FormattingUtils.humanNumber(
//         inputBasedOnSlectectAmount,
//         input,
//     )

//     const humanBalance = FormattingUtils.humanNumber(totalBalance, totalBalance)

//     return { humanTokenInputBasedOnSlectectAmount, humanBalance }
// }

const getPercentage = (
    totalBalance: BigNumber,
    isInputInFiat: boolean,
    input: BigNumber,
    totalBalanceInFiat: BigNumber,
) => {
    if (totalBalance.isZero()) return { percentage: 0 }

    if (isInputInFiat) {
        return {
            percentage: new BigNumber(input).div(totalBalanceInFiat).multipliedBy(100).toNumber() || 0,
        }
    }

    return {
        percentage: new BigNumber(input).div(totalBalance).multipliedBy(100).toNumber() || 0,
    }
}

// ~ HOOKS
//
const useCalculatePercentage = ({
    totalBalance,
    checkIsInputAmountValid,
    isInputInFiat,
    exchangeRate,
}: {
    totalBalance: BigNumber
    checkIsInputAmountValid: (newValue: string) => void
    isInputInFiat: boolean
    exchangeRate: CurrencyExchangeRate | undefined
}) => {
    const onChangePercentage = (value: number) => {
        const newTokenInput = totalBalance.div(100).multipliedBy(value).toString()

        checkIsInputAmountValid(
            isInputInFiat
                ? Number(
                      FormattingUtils.convertToFiatBalance(newTokenInput || "0", exchangeRate?.rate ?? 1, 0),
                  ).toFixed(2)
                : new BigNumber(newTokenInput).decimalPlaces(4, BigNumber.ROUND_DOWN).toString(),
        )
    }

    const throttleOnChangePercentage = throttle(onChangePercentage, 100)

    return { throttleOnChangePercentage }
}
