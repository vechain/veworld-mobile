import React, { useCallback, useState } from "react"
import { FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseButton, BaseText, BaseView } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    PaymentProvider,
    usePaymentProviderList,
} from "../../Hooks/usePaymentProviderList"

export const PaymentProviderList = () => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()

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
                        alignItems="center"
                        justifyContent="center"
                        style={isSelected ? styles.cardSelected : styles.card}>
                        <BaseView
                            style={styles.imageContainer}
                            flexDirection="row">
                            {item.img}
                        </BaseView>
                        {isSelected && (
                            <>
                                <BaseText style={styles.description}>
                                    {item.description}
                                </BaseText>

                                <BaseButton
                                    title={item.buttonText}
                                    disabled={!isSelected}
                                    style={styles.button}
                                    action={() =>
                                        nav.navigate(Routes.BUY_WEBVIEW)
                                    }
                                />
                            </>
                        )}
                    </BaseView>
                </TouchableWithoutFeedback>
            )
        },
        [selectedProviderId, styles, nav],
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
            borderWidth: 1,
            borderColor: theme.colors.card,
        },
        cardSelected: {
            backgroundColor: theme.colors.card,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: 20,
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
