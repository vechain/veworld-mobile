import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { KeyboardAvoidingView } from "react-native"
import { useAmountInput, useTheme } from "~Hooks"
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

    const { input, setInput } = useAmountInput()
    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)

    const { totalBalance } = convertBalanceToBigNumber(token)
    const { humanFiatInput, totalBalanceInFiat } = getFiatBalances(input, totalBalance, exchangeRate)
    const { humanTokenInputBasedOnSlectectAmount, humanBalance } = getTokeBalances({
        input,
        exchangeRate,
        totalBalance,
    })

    const { percentage } = getPercentage(totalBalance, isInputInFiat, input, totalBalanceInFiat)

    // ~ OK
    const checkIsInputAmountValid = useCallback(
        (newValue: string) => {
            if (new BigNumber(newValue).gt(totalBalance)) {
                setIsError(true)
            } else {
                setIsError(false)
            }
            setInput(newValue)
        },
        [totalBalance, setInput],
    )

    const { throttleOnChangePercentage } = useCalculatePercentage({
        totalBalance,
        checkIsInputAmountValid,
        isInputInFiat,
        exchangeRate,
    })

    // ~ OK
    const handleToggleInputInFiat = useCallback(() => {
        checkIsInputAmountValid(isInputInFiat ? humanTokenInputBasedOnSlectectAmount : humanFiatInput)
        setIsInputInFiat(s => !s)
    }, [humanFiatInput, humanTokenInputBasedOnSlectectAmount, checkIsInputAmountValid, isInputInFiat])

    const { inputColor, placeholderColor, shortenedTokenName } = getUI({
        theme,
        isError,
        token,
        input,
    })

    const navigateToNextStep = useCallback(() => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? humanTokenInputBasedOnSlectectAmount : input,
            initialRoute: initialRoute ?? "",
        })
    }, [initialRoute, input, isInputInFiat, nav, humanTokenInputBasedOnSlectectAmount, token])

    return (
        <Layout
            safeAreaTestID="Select_Amount_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <DismissKeyboardView>
                    <KeyboardAvoidingView behavior="padding">
                        <BaseView>
                            <AmountHeaderCard humanBalance={humanBalance} token={token} isError={isError} />

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
                                humanTokenInputBasedOnSlectectAmount={humanTokenInputBasedOnSlectectAmount}
                                humanFiatInput={humanFiatInput}
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
                    disabled={isError || input === "" || new BigNumber(input).isZero()}
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
    input: string
}) => {
    const inputColor = isError ? theme.colors.danger : theme.colors.text

    const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

    const shortenedTokenName = token.name.length > 30 ? `${token.name.slice(0, 29)}...` : token.name

    return { inputColor, placeholderColor, shortenedTokenName }
}

const getFiatBalances = (
    input: string,
    totalBalance: BigNumber,
    exchangeRate: CurrencyExchangeRate | undefined,
) => {
    const humanFiatInput = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(input || "0", exchangeRate?.rate ?? 1, 0),
        input || "0",
    )

    const totalBalanceInFiat = FormattingUtils.convertToFiatBalance(
        totalBalance || "0",
        exchangeRate?.rate || 1,
        0,
    )

    return { humanFiatInput, totalBalanceInFiat }
}

const getTokeBalances = ({
    input,
    exchangeRate,
    totalBalance,
}: {
    input: string
    exchangeRate: CurrencyExchangeRate | undefined
    totalBalance: BigNumber
}) => {
    /*
        This one displays the human readable amount of tokens selected by the user both from the slider and the/or the input
        NOTE - They don't display the fiat amount (correctly)
        It is used for the small print under the input (to give the user the info on what he is sending relative to the selected token/fiat)
    */
    const inputBasedOnSlectectAmount = FormattingUtils.convertToFiatBalance(
        input || "0",
        1 / (exchangeRate?.rate ?? 1),
        0,
    )

    const humanTokenInputBasedOnSlectectAmount = FormattingUtils.humanNumber(
        inputBasedOnSlectectAmount,
        input,
    )

    const humanBalance = FormattingUtils.humanNumber(totalBalance, totalBalance)

    return { humanTokenInputBasedOnSlectectAmount, humanBalance }
}

export const getRawTokens = ({ amount }: { amount: BigNumber }) => {
    BigNumber.config({ EXPONENTIAL_AT: 1e9 })
    const decimalPlaces = amount.decimalPlaces()
    // Now, we want to remove the decimal places by multiplying by 10^x, where x is the number of decimal places
    const scaleFactor = new BigNumber(10).pow(decimalPlaces)
    // Multiply by the scaleFactor to shift decimal places
    return { rawSelectedTokenBalance: amount.multipliedBy(scaleFactor) }
}

const getPercentage = (
    totalBalance: BigNumber,
    isInputInFiat: boolean,
    input: string,
    rawTokenBalanceinFiat: string,
) => {
    if (totalBalance.isZero()) return { percentage: 0 }

    if (isInputInFiat) {
        return {
            percentage: new BigNumber(input).div(rawTokenBalanceinFiat).multipliedBy(100).toNumber() || 0,
        }
    }

    return {
        percentage: new BigNumber(input).div(totalBalance).multipliedBy(100).toNumber() || 0,
    }
}

const convertBalanceToBigNumber = (token: FungibleTokenWithBalance) => {
    return {
        totalBalance: new BigNumber(
            FormattingUtils.scaleNumberDown(token.balance.balance, token.decimals, token.decimals),
        ),
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
        // const { rawSelectedTokenBalance } = getRawTokens({ amount: new BigNumber(newTokenInput) })

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

/* requisites for tokens / fiat

- Need to carry on to the following steps

1. Need raw token balance of selected token amount 
2. Need raw token balance of slected fiat amount

3. Need human token balance of selected token amount only for display
4. Need human fiat balance of selected token amount only for display

*/
