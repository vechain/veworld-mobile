import React, { useCallback } from "react"
import { FlatList, StyleSheet, TouchableOpacity } from "react-native"
import { AnalyticsEvent, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { PaymentProvider, usePaymentProviderList } from "../../Hooks"

export const PaymentProviderList = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const track = useAnalyticTracking()

    const paymentsProviders = usePaymentProviderList()

    const renderItem = useCallback(
        ({ item }: { item: PaymentProvider }) => {
            const handleBuyClick = () => {
                nav.navigate(Routes.BUY_WEBVIEW)
                track(AnalyticsEvent.BUY_CRYPTO_PROVIDER_SELECTED, { provider: item.id })
            }
            return (
                <TouchableOpacity key={item.id} onPress={handleBuyClick}>
                    <BaseView flexDirection="row" borderRadius={12} mb={20} style={styles.card}>
                        <BaseView
                            flexDirection="column"
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            p={20}
                            w={90}>
                            <BaseView flexDirection="row" justifyContent="space-between">
                                <BaseView flex={1} flexDirection="row">
                                    {item.img}
                                    <BaseText fontSize={18} pl={10} color={theme.colors.text}>
                                        {item.name}
                                    </BaseText>
                                </BaseView>
                                {item.paymentMethods.map(method => (
                                    <React.Fragment key={method.id}>
                                        <BaseSpacer width={10} />
                                        <BaseIcon name={method.icon} size={23} color={theme.colors.text} />
                                    </React.Fragment>
                                ))}
                            </BaseView>

                            <BaseSpacer height={10} />
                            <BaseText fontSize={14} color={theme.colors.text} py={10}>
                                {item.description}
                            </BaseText>
                        </BaseView>
                        <BaseView style={styles.arrowBackground} flex={1} flexDirection="row" justifyContent="center">
                            <BaseIcon color={theme.colors.textReversed} name="chevron-right" />
                        </BaseView>
                    </BaseView>
                </TouchableOpacity>
            )
        },
        [nav, styles.arrowBackground, styles.card, theme.colors.text, theme.colors.textReversed, track],
    )

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={paymentsProviders}
            renderItem={renderItem}
            keyExtractor={item => item.id}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.colors.card,
        },
        button: {
            backgroundColor: theme.colors.primary,
            width: "100%",
            marginTop: 20,
        },
        arrowBackground: {
            height: "100%",
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            backgroundColor: theme.colors.primary,
        },
    })
