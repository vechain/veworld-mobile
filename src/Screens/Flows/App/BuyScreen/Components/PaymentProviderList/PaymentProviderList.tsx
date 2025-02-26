import React, { useCallback } from "react"
import { FlatList, StyleSheet, TouchableOpacity } from "react-native"
import { AnalyticsEvent, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { PaymentProvider, usePaymentProviderList } from "../../Hooks"
import { useI18nContext } from "~i18n"
import { PaymentMethodsIds } from "../../Hooks/constants"
import { ApplePaySVG } from "~Assets"

export const PaymentProviderList = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const { LL } = useI18nContext()

    const paymentsProviders = usePaymentProviderList()

    const renderItem = useCallback(
        ({ item }: { item: PaymentProvider }) => {
            const handleBuyClick = () => {
                nav.navigate(Routes.BUY_WEBVIEW, { provider: item.id, providerName: item.name })
                track(AnalyticsEvent.BUY_CRYPTO_PROVIDER_SELECTED, { provider: item.id })
            }
            return (
                <TouchableOpacity key={item.id} onPress={handleBuyClick}>
                    <BaseView flexDirection="row" borderRadius={16} mb={20} py={24} px={16} style={styles.card}>
                        {item.img}
                        <BaseView
                            flexDirection="column"
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            flex={1}
                            style={[styles.container]}>
                            <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.text}>
                                {item.name}
                            </BaseText>
                            <BaseView
                                flexDirection="row"
                                justifyContent="space-between"
                                flex={1}
                                style={[styles.subTitlesContainer]}>
                                <BaseView flexDirection="row" justifyContent="flex-start">
                                    <BaseText typographyFont="captionSemiBold" color={theme.colors.subtitle}>
                                        {LL.SB_PAY_WITH()}
                                    </BaseText>
                                    {item.paymentMethods.map(method => (
                                        <React.Fragment key={method.id}>
                                            <BaseSpacer width={8} />
                                            {method.id === PaymentMethodsIds.ApplePay ? (
                                                <ApplePaySVG />
                                            ) : (
                                                <BaseIcon name={method.icon} size={12} color={theme.colors.text} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </BaseView>
                                <BaseSpacer width={12} />
                                <BaseView flexDirection="row">
                                    <BaseText typographyFont="captionSemiBold" color={theme.colors.subtitle}>
                                        {LL.SB_FEES()}
                                    </BaseText>
                                    <BaseSpacer width={8} />
                                    <BaseText typographyFont="captionSemiBold">{item.fees}</BaseText>
                                </BaseView>
                            </BaseView>
                        </BaseView>
                        <BaseView flex={1} flexDirection="row" justifyContent="flex-end">
                            <BaseIcon color={theme.colors.textLight} name="icon-chevron-right" />
                        </BaseView>
                    </BaseView>
                </TouchableOpacity>
            )
        },
        [
            LL,
            nav,
            styles.card,
            styles.container,
            styles.subTitlesContainer,
            theme.colors.subtitle,
            theme.colors.text,
            theme.colors.textLight,
            track,
        ],
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
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.cardBorder,
            borderWidth: 1,
            gap: 16,
            flex: 1,
        },
        container: {
            gap: 8,
        },
        subTitlesContainer: {
            gap: 8,
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
            alignSelf: "flex-end",
        },
    })
