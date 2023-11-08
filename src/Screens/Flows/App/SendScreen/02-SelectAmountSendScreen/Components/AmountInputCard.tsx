import React from "react"
import { StyleSheet, TextInput } from "react-native"
import { BaseCardGroup, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, CURRENCY, CURRENCY_SYMBOLS, typography } from "~Constants"
import { FungibleTokenWithBalance } from "~Model"
const { defaults: defaultTypography } = typography

export const AmountInputCard = ({
    isInputInFiat,
    currency,
    shortenedTokenName,
    token,
    inputColor,
    placeholderColor,
    input,
    handleChangeInput,
    isExchangeRateAvailable,
    handleToggleInputInFiat,
    humanTokenInputBasedOnSlectectAmount,
    humanFiatInput,
}: {
    isInputInFiat: boolean
    currency: CURRENCY
    shortenedTokenName: string
    token: FungibleTokenWithBalance
    inputColor: string
    placeholderColor: string
    input: string
    handleChangeInput: (newValue: string) => void
    isExchangeRateAvailable: boolean
    handleToggleInputInFiat: () => void
    humanTokenInputBasedOnSlectectAmount: string
    humanFiatInput: string
}) => {
    return (
        <BaseCardGroup
            views={[
                {
                    children: (
                        <BaseView flex={1} style={styles.amountContainer}>
                            <BaseText typographyFont="captionBold">
                                {isInputInFiat ? currency : shortenedTokenName}
                            </BaseText>
                            <BaseSpacer height={6} />
                            <BaseView flexDirection="row" p={6}>
                                {isInputInFiat ? (
                                    <BaseText typographyFont="largeTitle">
                                        {CURRENCY_SYMBOLS[currency]}
                                    </BaseText>
                                ) : (
                                    <TokenImage
                                        icon={token.icon}
                                        tokenAddress={token.address}
                                        symbol={token.symbol}
                                        height={20}
                                        width={20}
                                    />
                                )}
                                <BaseSpacer width={16} />
                                <TextInput
                                    placeholder="0"
                                    style={[
                                        // @ts-ignore
                                        styles.input,
                                        // eslint-disable-next-line react-native/no-inline-styles
                                        {
                                            color: inputColor,
                                            fontSize: 26,
                                        },
                                    ]}
                                    placeholderTextColor={placeholderColor}
                                    keyboardType="numeric"
                                    value={input}
                                    onChangeText={handleChangeInput}
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
                                  <BaseText typographyFont="captionBold" color={inputColor}>
                                      {"≈ "}
                                      {isInputInFiat
                                          ? humanTokenInputBasedOnSlectectAmount
                                          : humanFiatInput}{" "}
                                      {isInputInFiat ? token.symbol : currency}
                                  </BaseText>
                              ),
                              style: styles.counterValueView,
                          },
                      ]
                    : []),
            ]}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        ...defaultTypography.largeTitle,
        flex: 1,
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
