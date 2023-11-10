import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useState } from "react"
import { KeyboardAvoidingView } from "react-native"
import { useTheme } from "~Hooks"
import { BaseSpacer, BaseView, DismissKeyboardView, FadeoutButton, Layout } from "~Components"
import { RootStackParamListDiscover, RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, ColorThemeType } from "~Constants"
import { selectCurrency, selectCurrencyExchangeRate, useAppSelector } from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useNavigation } from "@react-navigation/native"
import { throttle } from "lodash"
import { FungibleTokenWithBalance } from "~Model"
import { AmountHeaderCard, AmountInputCard, AmountSliderCard } from "./Components"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_AMOUNT_SEND
>

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { initialRoute, token } = route.params
    // without this the native text will crash when we get numbers shows as exponential notation.
    BigNumber.config({ EXPONENTIAL_AT: 1e9 })

    const theme = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const exchangeRate = useAppSelector(state => selectCurrencyExchangeRate(state, token))
    const isExchangeRateAvailable = !!exchangeRate?.rate
    const currency = useAppSelector(selectCurrency)

    const [tokenAmount, setTokenAmount] = useState(new BigNumber(0))
    const [fiatAmount, setFiatAmount] = useState(new BigNumber(0))

    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)

    const totalBalance = useMemo(() => new BigNumber(token.balance.balance), [token])
    const totalBalanceInFiat = useMemo(
        () => totalBalance.multipliedBy(exchangeRate?.rate || 1),
        [totalBalance, exchangeRate?.rate],
    )

    const { percentage } = useMemo(
        () => getPercentage(totalBalance, isInputInFiat, tokenAmount, fiatAmount, totalBalanceInFiat),
        [fiatAmount, isInputInFiat, tokenAmount, totalBalance, totalBalanceInFiat],
    )

    const checkIsInputAmountValid = useCallback(
        (newValue: BigNumber) => {
            if (newValue.gt(isInputInFiat ? totalBalanceInFiat : totalBalance)) {
                setIsError(true)
            } else {
                setIsError(false)
            }

            setFiatAmount(newValue)
            setTokenAmount(newValue)
        },
        [isInputInFiat, totalBalance, totalBalanceInFiat],
    )

    const onChangePercentage = useCallback(
        (value: number) => {
            const newTokenInput = totalBalance.div(100).multipliedBy(value)
            if (
                newTokenInput.multipliedBy(exchangeRate?.rate || 1).gt(totalBalanceInFiat) ||
                newTokenInput.gt(totalBalance)
            ) {
                setIsError(true)
            } else {
                setIsError(false)
            }
            setTokenAmount(newTokenInput)
            setFiatAmount(newTokenInput.multipliedBy(exchangeRate?.rate || 1))
        },
        [exchangeRate?.rate, totalBalance, totalBalanceInFiat],
    )
    const throttleOnChangePercentage = throttle(onChangePercentage, 100)

    const handleToggleInputInFiat = useCallback(() => {
        if (fiatAmount.gt(totalBalanceInFiat) || tokenAmount.gt(totalBalance)) {
            setIsError(true)
        } else {
            setIsError(false)
        }
        setIsInputInFiat(s => !s)
    }, [fiatAmount, tokenAmount, totalBalance, totalBalanceInFiat])

    const { inputColor, placeholderColor, shortenedTokenName } = getUI({
        theme,
        isError,
        token,
    })

    const navigateToNextStep = useCallback(() => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? fiatAmount : tokenAmount,
            initialRoute: initialRoute ?? "",
        })
    }, [fiatAmount, initialRoute, isInputInFiat, nav, token, tokenAmount])

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
                                fiatAmount={fiatAmount}
                                tokenAmount={tokenAmount}
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
                    disabled={
                        isError ||
                        tokenAmount.isNaN() ||
                        tokenAmount.isZero() ||
                        fiatAmount.isNaN() ||
                        fiatAmount.isZero()
                    }
                    action={navigateToNextStep}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

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

const getPercentage = (
    totalBalance: BigNumber,
    isInputInFiat: boolean,
    tokenAmount: BigNumber,
    fiatAmount: BigNumber,
    totalBalanceInFiat: BigNumber,
) => {
    if (totalBalance.isZero()) return { percentage: 0 }

    if (isInputInFiat) {
        return {
            percentage: fiatAmount.div(totalBalanceInFiat).multipliedBy(100).toNumber() || 0,
        }
    }

    return {
        percentage: tokenAmount.div(totalBalance).multipliedBy(100).toNumber() || 0,
    }
}
