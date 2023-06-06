import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useEffect, useMemo, useState } from "react"
import { StyleSheet, TextInput } from "react-native"
import { CURRENCY_SYMBOLS, debug, useAmountInput, useTheme } from "~Common"
import { FormattingUtils } from "~Utils"
import {
    BaseText,
    BaseSafeArea,
    BackButtonHeader,
    BaseView,
    BaseSpacer,
    BaseCardGroup,
    BaseIcon,
    BaseCard,
    BaseRange,
    BaseButton,
} from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, typography } from "~Common/Theme"
import {
    selectCurrencyExchangeRate,
    selectCurrency,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useNavigation } from "@react-navigation/native"
const { defaults: defaultTypography } = typography

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_AMOUNT_SEND
>

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { token, initialRoute } = route.params

    const theme = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { input, setInput } = useAmountInput()
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token.symbol),
    )
    const currency = useAppSelector(selectCurrency)

    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)

    const rawTokenBalance = FormattingUtils.scaleNumberDown(
        token.balance.balance,
        token.decimals,
    )
    const formattedTokenBalance = FormattingUtils.humanNumber(
        rawTokenBalance,
        rawTokenBalance,
    )
    const rawTokenBalanceinFiat = FormattingUtils.convertToFiatBalance(
        rawTokenBalance || "0",
        exchangeRate?.rate || 1,
        0,
    )

    const isExchangeRateAvailable = !!exchangeRate?.rate
    const formattedFiatInput = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            input || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        input,
    )
    const rawTokenInput = FormattingUtils.convertToFiatBalance(
        input || "0",
        1 / (exchangeRate?.rate || 1),
        0,
    )
    const formattedTokenInput = FormattingUtils.humanNumber(
        rawTokenInput,
        input,
    )

    const percentage = useMemo(() => {
        const isRawTokenBalanceZero = new BigNumber(rawTokenBalance).isZero()
        if (isRawTokenBalanceZero) return 0

        if (isInputInFiat)
            return (
                new BigNumber(input)
                    .div(rawTokenBalanceinFiat)
                    .multipliedBy(100)
                    .toNumber() || 0
            )
        return (
            new BigNumber(input)
                .div(rawTokenBalance)
                .multipliedBy(100)
                .toNumber() || 0
        )
    }, [input, rawTokenBalance, rawTokenBalanceinFiat, isInputInFiat])

    const handleToggleInputInFiat = () => {
        setInput(isInputInFiat ? formattedTokenInput : formattedFiatInput)
        setIsInputInFiat(s => !s)
    }

    const onChangePercentage = (value: number) => {
        const newTokenInput = new BigNumber(rawTokenBalance)
            .div(100)
            .multipliedBy(value)
            .toString()
        setInput(
            isInputInFiat
                ? Number(
                      FormattingUtils.convertToFiatBalance(
                          newTokenInput || "0",
                          exchangeRate?.rate || 1,
                          0,
                      ),
                  ).toFixed(2)
                : newTokenInput,
        )
    }
    const handleChangeInput = (newValue: string) => {
        if (new BigNumber(newValue).gt(rawTokenBalance)) {
            setIsError(true)
        } else {
            setIsError(false)
        }
        setInput(newValue)
    }
    const goToInsertAddress = () => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? rawTokenInput : input,
            initialRoute: initialRoute ?? "",
        })
    }

    const inputColor = isError ? theme.colors.danger : theme.colors.text

    useEffect(() => {
        debug({ percentage })
    }, [percentage])

    return (
        <BaseSafeArea
            grow={1}
            style={styles.safeArea}
            testID="Select_Amount_Send_Screen">
            <BaseView>
                <BackButtonHeader />
                <BaseView mx={24}>
                    <BaseText typographyFont="subTitleBold">
                        {LL.SEND_TOKEN_TITLE()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="button">
                        {LL.SEND_CURRENT_BALANCE()}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <BaseView
                        flexDirection="row"
                        alignItems="baseline"
                        style={styles.budget}>
                        <BaseText typographyFont="subTitleBold">
                            {formattedTokenBalance}
                        </BaseText>
                        <BaseSpacer width={5} />
                        <BaseText typographyFont="buttonSecondary">
                            {token.symbol}
                        </BaseText>
                    </BaseView>
                    {isError && (
                        <BaseView>
                            <BaseSpacer height={8} />
                            <BaseView flexDirection="row">
                                <BaseIcon
                                    name={"alert-circle-outline"}
                                    size={20}
                                    color={theme.colors.danger}
                                />
                                <BaseSpacer width={8} />
                                <BaseText
                                    typographyFont="body"
                                    fontSize={12}
                                    color={theme.colors.danger}>
                                    {LL.SEND_INSUFFICIENT_BALANCE()}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    )}
                </BaseView>
                <BaseSpacer height={16} />
                <BaseCardGroup
                    views={[
                        {
                            children: (
                                <BaseView
                                    flex={1}
                                    style={styles.amountContainer}>
                                    <BaseText typographyFont="captionBold">
                                        {isInputInFiat
                                            ? currency
                                            : token.symbol}
                                    </BaseText>
                                    <BaseSpacer height={6} />
                                    <BaseView flexDirection="row">
                                        {isInputInFiat ? (
                                            <BaseText typographyFont="largeTitle">
                                                {CURRENCY_SYMBOLS[currency]}
                                            </BaseText>
                                        ) : (
                                            <TokenImage icon={token.icon} />
                                        )}
                                        <BaseSpacer width={16} />
                                        <TextInput
                                            placeholder="0"
                                            style={[
                                                {
                                                    color: inputColor,
                                                },
                                                // @ts-ignore
                                                styles.input,
                                            ]}
                                            placeholderTextColor={inputColor}
                                            keyboardType="numeric"
                                            value={input}
                                            onChangeText={handleChangeInput}
                                            maxLength={10}
                                            testID="SendScreen_amountInput"
                                        />
                                    </BaseView>
                                    {isExchangeRateAvailable && (
                                        <BaseIcon
                                            name={"autorenew"}
                                            size={20}
                                            color={COLORS.DARK_PURPLE}
                                            bg={COLORS.LIME_GREEN}
                                            style={styles.icon}
                                            action={handleToggleInputInFiat}
                                        />
                                    )}
                                </BaseView>
                            ),
                            style: styles.amountView,
                        },
                        ...(isExchangeRateAvailable
                            ? [
                                  {
                                      children: (
                                          <BaseText
                                              typographyFont="captionBold"
                                              color={inputColor}>
                                              {"≈ "}
                                              {isInputInFiat
                                                  ? formattedTokenInput
                                                  : formattedFiatInput}{" "}
                                              {isInputInFiat
                                                  ? token.symbol
                                                  : currency}
                                          </BaseText>
                                      ),
                                      style: styles.counterValueView,
                                  },
                              ]
                            : []),
                    ]}
                />
                <BaseSpacer height={16} />
                <BaseView mx={24}>
                    <BaseCard>
                        <BaseView flex={1}>
                            <BaseText typographyFont="button">
                                {LL.SEND_BALANCE_PERCENTAGE()}
                            </BaseText>
                            <BaseView flexDirection="row">
                                <BaseText
                                    typographyFont="captionBold"
                                    color={theme.colors.primary}>
                                    {LL.SEND_RANGE_ZERO()}
                                </BaseText>
                                <BaseSpacer width={8} />
                                {/** TODO: understand how to add percentage value label */}
                                <BaseRange
                                    value={percentage}
                                    onChange={onChangePercentage}
                                />
                                <BaseSpacer width={8} />
                                <BaseText
                                    typographyFont="captionBold"
                                    color={theme.colors.primary}>
                                    {LL.SEND_RANGE_MAX()}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseCard>
                </BaseView>
            </BaseView>
            <BaseButton
                style={styles.nextButton}
                mx={24}
                title={LL.COMMON_BTN_NEXT()}
                disabled={
                    isError || input === "" || new BigNumber(input).isZero()
                }
                action={goToInsertAddress}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    input: {
        ...defaultTypography.largeTitle,
        flex: 1,
    },
    safeArea: {
        justifyContent: "space-between",
    },
    budget: {
        justifyContent: "flex-start",
    },
    amountContainer: {
        overflow: "visible",
    },
    icon: {
        position: "absolute",
        right: 16,
        bottom: -32,
        padding: 8,
    },
    amountView: {
        zIndex: 2,
    },
    counterValueView: {
        zIndex: 1,
    },
    nextButton: {
        marginBottom: 70,
    },
})
