import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { StyleSheet, TextInput } from "react-native"
import { CURRENCY_SYMBOLS, FormattingUtils, useAmountInput } from "~Common"
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
} from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, typography } from "~Common/Theme"
import {
    getCurrencyExchangeRate,
    selectCurrency,
    useAppSelector,
} from "~Storage/Redux"
import { VeChainToken } from "~Model"

const { defaults: defaultTypography } = typography

type Props = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.SELECT_AMOUNT_SEND
>

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { token } = route?.params
    const { input, setInput } = useAmountInput()
    const [inputInFiat, setInputInFiat] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const currency = useAppSelector(selectCurrency)
    // TODO: understand what happen with balances of official tokens
    const formattedBalance = token.custom
        ? token.balance.balance
        : FormattingUtils.humanNumber(
              FormattingUtils.convertToFiatBalance(
                  token.balance.balance,
                  1,
                  token.decimals,
              ),
              token.balance.balance,
          )
    const exchangeRate = useAppSelector(state =>
        getCurrencyExchangeRate(state, token.symbol as VeChainToken),
    )
    const isExchangeRateAvailable = !!exchangeRate?.rate
    const fiatBalance = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            input || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        input,
    )
    const tokenUnitBalance = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            input || "0",
            1 / (exchangeRate?.rate || 1),
            0,
        ),
        input,
    )
    const handleToggleInputInFiat = () => {
        setInput(inputInFiat ? tokenUnitBalance : fiatBalance)
        setInputInFiat(s => !s)
    }
    return (
        <BaseSafeArea grow={1}>
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
                <BaseView flexDirection="row" alignItems="baseline">
                    <BaseText typographyFont="subTitleBold">
                        {formattedBalance}
                    </BaseText>
                    <BaseSpacer width={5} />
                    <BaseText typographyFont="buttonSecondary">
                        {token.symbol}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseCardGroup
                views={[
                    {
                        children: (
                            <BaseView flex={1} style={styles.container}>
                                <BaseText typographyFont="captionBold">
                                    {inputInFiat ? currency : token.symbol}
                                </BaseText>
                                <BaseSpacer height={6} />
                                <BaseView flexDirection="row">
                                    {inputInFiat ? (
                                        <BaseText typographyFont="largeTitle">
                                            {CURRENCY_SYMBOLS[currency]}
                                        </BaseText>
                                    ) : (
                                        <TokenImage icon={token.icon} />
                                    )}
                                    <BaseSpacer width={16} />
                                    <TextInput
                                        placeholder="0"
                                        // @ts-ignore
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={input}
                                        onChangeText={setInput}
                                        maxLength={10}
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
                                      <BaseText typographyFont="captionBold">
                                          {"≈ "}
                                          {inputInFiat
                                              ? tokenUnitBalance
                                              : fiatBalance}{" "}
                                          {inputInFiat
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
                        <BaseRange
                            value={percentage}
                            setValue={setPercentage}
                        />
                    </BaseView>
                </BaseCard>
            </BaseView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    input: {
        ...defaultTypography.largeTitle,
        flex: 1,
    },
    container: {
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
