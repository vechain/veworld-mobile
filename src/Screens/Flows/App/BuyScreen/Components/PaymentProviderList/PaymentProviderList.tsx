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
import { PaymentProvider, usePaymentProviderList } from "../../Hooks"

export const PaymentProviderList = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const paymentsProviders = usePaymentProviderList()

    const [selectedProviderId, setSelectedProviderId] = useState(
        paymentsProviders[0] ? paymentsProviders[0].id : "",
    )

    const handleBuyClick = useCallback(
        () => nav.navigate(Routes.BUY_WEBVIEW),
        [nav],
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
                        p={20}
                        borderRadius={12}
                        mb={20}
                        style={styles.card}>
                        <BaseView
                            style={styles.imageContainer}
                            flexDirection="row"
                            justifyContent="space-between">
                            <BaseView
                                style={styles.imageContainer}
                                flex={1}
                                flexDirection="row">
                                {item.img}
                                <BaseText
                                    fontSize={18}
                                    pl={10}
                                    color={theme.colors.text}>
                                    {item.name}
                                </BaseText>
                            </BaseView>
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
                        <BaseText
                            fontSize={14}
                            color={theme.colors.text}
                            py={10}>
                            {item.description}
                        </BaseText>

                        <BaseButton
                            title={item.buttonText}
                            disabled={!isSelected}
                            style={styles.button}
                            action={handleBuyClick}
                        />
                    </BaseView>
                </TouchableWithoutFeedback>
            )
        },
        [selectedProviderId, styles, theme, handleBuyClick],
    )

    return (
        <FlatList
            data={paymentsProviders}
            renderItem={renderItem}
            keyExtractor={item => item.id}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        imageContainer: {
            width: "100%",
        },
        card: {
            backgroundColor: theme.colors.card,
        },
        button: {
            backgroundColor: theme.colors.primary,
            width: "100%",
            marginTop: 20,
        },
    })
