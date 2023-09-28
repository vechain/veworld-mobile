import React, { useCallback, useState } from "react"
import { FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    PaymentProvider,
    usePaymentProviderList,
} from "../../Hooks/usePaymentProviderList"
import { useI18nContext } from "~i18n"

export const PaymentProviderList = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const paymentsProviders = usePaymentProviderList()

    const [selectedProviderId, setSelectedProviderId] = useState(
        paymentsProviders[0] ? paymentsProviders[0].id : "",
    )

    const renderItem = useCallback(
        ({ item }: { item: PaymentProvider }) => {
            const isSelected = item.id === selectedProviderId
            return (
                <TouchableWithoutFeedback
                    onPress={() => setSelectedProviderId(item.id)}>
                    <BaseView
                        flexDirection="column"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        style={styles.card}>
                        <BaseView
                            style={styles.imageContainer}
                            flexDirection="row"
                            justifyContent="space-between">
                            <BaseView
                                style={styles.imageContainer}
                                flexDirection="row">
                                {item.img}
                                <BaseText style={styles.providerName}>
                                    {item.name}
                                </BaseText>
                            </BaseView>
                            <BaseText>{LL.BD_PAYMENT_METHODS()}</BaseText>
                            {item.paymentMethods.map(method => (
                                <>
                                    <BaseSpacer width={10} />
                                    <BaseIcon
                                        key={method.id}
                                        name={method.icon}
                                        size={23}
                                        color={theme.colors.text}
                                    />
                                </>
                            ))}
                        </BaseView>

                        <BaseSpacer height={10} />
                        <BaseText style={styles.description}>
                            {item.description}
                        </BaseText>

                        <BaseButton
                            title={item.buttonText}
                            disabled={!isSelected}
                            style={styles.button}
                            action={() => nav.navigate(Routes.BUY_WEBVIEW)}
                        />
                    </BaseView>
                </TouchableWithoutFeedback>
            )
        },
        [selectedProviderId, styles, nav, theme, LL],
    )

    return (
        <FlatList
            data={paymentsProviders}
            renderItem={({ item }) => renderItem({ item })}
            keyExtractor={item => item.id}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        imageContainer: {
            flex: 1,
            width: "100%",
        },
        card: {
            backgroundColor: theme.colors.card,
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
        },
        providerName: {
            fontSize: 18,
            paddingLeft: 10,
            color: theme.colors.text,
        },
        description: {
            fontSize: 14,
            color: theme.colors.text,
            paddingVertical: 10,
        },
        button: {
            backgroundColor: theme.colors.primary,
            width: "100%",
            marginTop: 20,
        },
    })
