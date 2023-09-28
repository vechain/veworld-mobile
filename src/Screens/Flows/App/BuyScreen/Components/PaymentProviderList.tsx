import React, { useCallback, useState } from "react"
import { FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import CoinbaseLogoSvg from "~Assets/Img/CoinbaseLogoSvg"
import { BaseButton, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

type PaymentProvider = {
    id: string
    description: string
    buttonText: string
    img: JSX.Element
}

export const PaymentProviderList = () => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const paymentsProviders: PaymentProvider[] = [
        {
            id: "1",
            description:
                "Buy you VechainThor tokens with Coinbase and receive them directly in your wallet. Coinbase is a secure online platform for buying, selling, transferring, and storing cryptocurrency.",
            img: (
                <CoinbaseLogoSvg
                    width={"60%"}
                    fill={theme.isDark ? theme.colors.text : undefined}
                />
            ),
            buttonText: LL.BTN_BUY_COINBASE(),
        },
    ]
    const [selectedProviderId, setSelectedProviderId] = useState(
        paymentsProviders[0].id,
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
                                    onPress={() => {
                                        nav.navigate(Routes.BUY_WEBVIEW)
                                    }}
                                    disabled={!isSelected}
                                    style={styles.button}
                                    action={function (): void {
                                        throw new Error(
                                            "Function not implemented.",
                                        )
                                    }}
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
