import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useEffect, useMemo, useState } from "react"
import { KeyboardAvoidingView, StyleSheet, TextInput } from "react-native"
import { useAmountInput, useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import {
    BaseCard,
    BaseCardGroup,
    BaseIcon,
    BaseRange,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    FadeoutButton,
    Layout,
} from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, CURRENCY_SYMBOLS, typography } from "~Constants"
import {
    selectCurrency,
    selectCurrencyExchangeRate,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useNavigation } from "@react-navigation/native"
import { throttle } from "lodash"
import { useMaxAmount } from "./Hooks/useMaxAmount"

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

    useEffect(() => {
        if (__DEV__) setInput("0.000001")
    }, [setInput])

    const currency = useAppSelector(selectCurrency)

    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)

    const { maxTokenAmount } = useMaxAmount({ token })

    const rawTokenBalance = FormattingUtils.scaleNumberDown(
        token.balance.balance,
        token.decimals,
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
            exchangeRate?.rate ?? 1,
            0,
        ),
        input,
    )
    const rawTokenInput = FormattingUtils.convertToFiatBalance(
        input || "0",
        1 / (exchangeRate?.rate ?? 1),
        0,
    )
    const formattedTokenInput = FormattingUtils.humanNumber(
        rawTokenInput,
        input,
    )

    const percentage = useMemo(() => {
        if (new BigNumber(maxTokenAmount).isZero()) return 0

        if (isInputInFiat)
            return (
                new BigNumber(input)
                    .div(rawTokenBalanceinFiat)
                    .multipliedBy(100)
                    .toNumber() || 0
            )
        return (
            new BigNumber(input)
                .div(maxTokenAmount)
                .multipliedBy(100)
                .toNumber() || 0
        )
    }, [input, maxTokenAmount, rawTokenBalanceinFiat, isInputInFiat])

    const handleToggleInputInFiat = () => {
        setInput(isInputInFiat ? formattedTokenInput : formattedFiatInput)
        setIsInputInFiat(s => !s)
    }

    const onChangePercentage = (value: number) => {
        const newTokenInput = new BigNumber(maxTokenAmount)
            .div(100)
            .multipliedBy(value)
            .toString()
        setInput(
            isInputInFiat
                ? Number(
                      FormattingUtils.convertToFiatBalance(
                          newTokenInput || "0",
                          exchangeRate?.rate ?? 1,
                          0,
                      ),
                  ).toFixed(2)
                : new BigNumber(newTokenInput).decimalPlaces(4).toString(),
        )
    }

    const throttleOnChangePercentage = throttle(onChangePercentage, 100)

    const handleChangeInput = (newValue: string) => {
        if (new BigNumber(newValue).gt(maxTokenAmount)) {
            setIsError(true)
        } else {
            setIsError(false)
        }
        setInput(newValue)
    }

    const goToInsertAddress = async () => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? rawTokenInput : input,
            initialRoute: initialRoute ?? "",
        } as any) // Todo https://github.com/vechainfoundation/veworld-mobile/issues/867
    }

    const inputColor = isError ? theme.colors.danger : theme.colors.text

    return (
        <Layout
            safeAreaTestID="Select_Amount_Send_Screen"
            isScrollEnabled={false}
            title={LL.SEND_TOKEN_TITLE()}
            body={
                <DismissKeyboardView>
                    <KeyboardAvoidingView behavior="padding">
                        <BaseView>
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
                                                            {
                                                                CURRENCY_SYMBOLS[
                                                                    currency
                                                                ]
                                                            }
                                                        </BaseText>
                                                    ) : (
                                                        <TokenImage
                                                            icon={token.icon}
                                                        />
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
                                                        placeholderTextColor={
                                                            inputColor
                                                        }
                                                        keyboardType="numeric"
                                                        value={input}
                                                        onChangeText={
                                                            handleChangeInput
                                                        }
                                                        maxLength={10}
                                                        testID="SendScreen_amountInput"
                                                    />
                                                </BaseView>
                                                {isExchangeRateAvailable && (
                                                    <BaseIcon
                                                        name={"autorenew"}
                                                        size={20}
                                                        color={
                                                            COLORS.DARK_PURPLE
                                                        }
                                                        bg={COLORS.LIME_GREEN}
                                                        style={styles.icon}
                                                        action={
                                                            handleToggleInputInFiat
                                                        }
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
                                        {/* TODO (Davide) (https://github.com/vechainfoundation/veworld-mobile/issues/766) understand how to add percentage value label */}
                                        <BaseRange
                                            value={percentage}
                                            onChange={
                                                throttleOnChangePercentage
                                            }
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
                    </KeyboardAvoidingView>
                </DismissKeyboardView>
            }
            footer={
                <FadeoutButton
                    title={LL.COMMON_BTN_NEXT()}
                    disabled={
                        isError || input === "" || new BigNumber(input).isZero()
                    }
                    action={goToInsertAddress}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    input: {
        ...defaultTypography.largeTitle,
        flex: 1,
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
})
