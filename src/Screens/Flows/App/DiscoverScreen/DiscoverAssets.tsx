import React, { useState } from "react"
import {
    BaseSearchInput,
    BaseSpacer,
    BaseView,
    OfficialTokenCardWithExchangeRate,
} from "~Components"
import { selectTokenExchangeRates, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { StyleSheet, ScrollView } from "react-native"
import { info, useTheme } from "~Common"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

export const DiscoverAssets = () => {
    const { LL } = useI18nContext()
    const paddingBottom = useBottomTabBarHeight()
    const tokensWithCurrency = useAppSelector(selectTokenExchangeRates)

    const theme = useTheme()

    const [tokenQuery, setTokenQuery] = useState<string>("")

    const filteredTokens = tokensWithCurrency.filter(
        token =>
            token.name
                .toLocaleLowerCase()
                .includes(tokenQuery.toLocaleLowerCase()) ||
            token.symbol
                .toLocaleLowerCase()
                .includes(tokenQuery.toLocaleLowerCase()),
    )

    const handleClickToken = (token: FungibleToken) => () => {
        info(token)
    }

    return (
        <>
            <BaseSpacer height={24} />

            <BaseView mx={20} mb={24}>
                <BaseSearchInput
                    value={tokenQuery}
                    setValue={setTokenQuery}
                    placeholder={LL.MANAGE_TOKEN_SEARCH_TOKEN()}
                />
            </BaseView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[
                    styles.scrollViewContainer,
                    { paddingBottom },
                ]}
                style={[
                    { backgroundColor: theme.colors.background },
                    styles.paddingX,
                ]}>
                {filteredTokens.map(token => (
                    <OfficialTokenCardWithExchangeRate
                        key={token.address}
                        token={token}
                        action={handleClickToken(token)}
                    />
                ))}
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        marginTop: 12,
    },
    paddingX: {
        paddingHorizontal: 20,
    },
})
