import React, { useMemo, useState } from "react"
import {
    BaseSearchInput,
    BaseSpacer,
    BaseText,
    BaseView,
    OfficialTokenCardWithExchangeRate,
} from "~Components"
import { selectTokenExchangeRates, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { StyleSheet, ScrollView } from "react-native"
import { ColorThemeType, info, useThemedStyles } from "~Common"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

// import { FlashList } from "@shopify/flash-list"
// const ITEM_WIDTH = Dimensions.get("window").width - 40
// const ITEM_HEIGHT = 64

// TODO: Substitute Scrollview with FlashList #406

export const DiscoverAssets = () => {
    const { LL } = useI18nContext()
    const paddingBottom = useBottomTabBarHeight()
    const tokensWithCurrency = useAppSelector(selectTokenExchangeRates)

    const { styles: themedStyles } = useThemedStyles(
        baseStyles({
            paddingBottom,
        }),
    )

    const [tokenQuery, setTokenQuery] = useState<string>("")

    const filteredTokens = useMemo(
        () =>
            tokensWithCurrency.filter(
                token =>
                    token.name
                        .toLocaleLowerCase()
                        .includes(tokenQuery.toLocaleLowerCase()) ||
                    token.symbol
                        .toLocaleLowerCase()
                        .includes(tokenQuery.toLocaleLowerCase()),
            ),
        [tokenQuery, tokensWithCurrency],
    )

    const handleClickToken = (token: FungibleToken) => () => {
        info(token)
    }

    return (
        <>
            <BaseSpacer height={24} />

            <BaseView mx={24} mb={12}>
                <BaseSearchInput
                    value={tokenQuery}
                    setValue={setTokenQuery}
                    placeholder={LL.MANAGE_TOKEN_SEARCH_TOKEN()}
                />
            </BaseView>

            {filteredTokens.length ? (
                // <FlashList
                //     data={filteredTokens}
                //     keyExtractor={item => item.address}
                //     contentContainerStyle={themedStyles.contentContainerStyle}
                //     renderItem={({ item }) => {
                //         return (
                //             <OfficialTokenCardWithExchangeRate
                //                 key={item.address}
                //                 token={item}
                //                 action={handleClickToken(item)}
                //             />
                //         )
                //     }}
                //     showsVerticalScrollIndicator={false}
                //     showsHorizontalScrollIndicator={false}
                //     estimatedItemSize={ITEM_HEIGHT}
                //     estimatedListSize={{
                //         height: filteredTokens.length * ITEM_HEIGHT,
                //         width: ITEM_WIDTH,
                //     }}
                // />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentInsetAdjustmentBehavior="automatic"
                    contentContainerStyle={
                        themedStyles.contentContainerStyle_SCROLLVIEW
                    }
                    style={themedStyles.styles_SCROLLVIEW}>
                    {filteredTokens.map(token => (
                        <OfficialTokenCardWithExchangeRate
                            key={token.address}
                            token={token}
                            action={handleClickToken(token)}
                        />
                    ))}
                </ScrollView>
            ) : (
                <BaseView
                    flexGrow={1}
                    justifyContent="center"
                    alignItems="center"
                    pb={60}>
                    <BaseText>{LL.ERROR_NO_ASSETS_FOUND()}</BaseText>
                </BaseView>
            )}
        </>
    )
}

const baseStyles =
    ({ paddingBottom }: { paddingBottom: number }) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            contentContainerStyle: {
                paddingBottom,
                paddingTop: 12,
                paddingHorizontal: 20,
            },

            contentContainerStyle_SCROLLVIEW: {
                marginTop: 12,
                paddingBottom,
            },
            styles_SCROLLVIEW: {
                paddingHorizontal: 20,
                backgroundColor: theme.colors.background,
            },
        })
