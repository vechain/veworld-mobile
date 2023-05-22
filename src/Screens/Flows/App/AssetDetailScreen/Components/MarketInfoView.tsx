import React from "react"
import { CoinMarketInfo } from "~Storage/Redux/Types"
import { BaseText, BaseView } from "~Components"
import { ColorThemeType, useThemedStyles } from "~Common"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { useI18nContext } from "~i18n"
import { useFormattedMarketInfo } from "../Hooks/useFormattedMarketInfo"

export const MarketInfoView = ({
    marketInfo,
}: {
    marketInfo: CoinMarketInfo
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { marketCap, totalSupply, totalVolume, circulatingSupply } =
        useFormattedMarketInfo(marketInfo)

    return (
        <DropShadow style={theme.shadows.card}>
            <BaseView
                flexDirection="row"
                flexWrap="wrap"
                style={styles.container}>
                <BaseView w={50} p={12} style={styles.borderMarketCap}>
                    <BaseText>{LL.COMMON_MARKET_CAP()}</BaseText>
                    <BaseText typographyFont="bodyBold" py={4}>
                        {marketCap ?? "N/A"}
                    </BaseText>
                </BaseView>

                <BaseView w={50} p={12} style={styles.borderTotalSupply}>
                    <BaseText>{LL.COMMON_TOTAL_SUPPLY()}</BaseText>
                    <BaseText typographyFont="bodyBold" py={4}>
                        {totalSupply ?? "N/A"}
                    </BaseText>
                </BaseView>

                <BaseView w={50} p={12} style={styles.borderTotalVolume}>
                    <BaseText>{LL.COMMON_24H_VOLUME()}</BaseText>
                    <BaseText typographyFont="bodyBold" py={4}>
                        {totalVolume ?? "N/A"}
                    </BaseText>
                </BaseView>

                <BaseView w={50} p={12} style={styles.borderCirculatingSupply}>
                    <BaseText>{LL.COMMON_CIRCULATING_SUPPLY()}</BaseText>
                    <BaseText typographyFont="bodyBold" py={4}>
                        {circulatingSupply ?? "N/A"}
                    </BaseText>
                </BaseView>
            </BaseView>
        </DropShadow>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: theme.colors.card,
        },
        borderMarketCap: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.background,
            borderRightWidth: 1,
            borderRightColor: theme.colors.background,
        },
        borderTotalSupply: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.background,
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.background,
        },
        borderTotalVolume: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.background,
            borderRightWidth: 1,
            borderRightColor: theme.colors.background,
        },
        borderCirculatingSupply: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.background,
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.background,
        },
    })
