import React from "react"
import { BaseButton, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { PaymentProviderList } from "./Components/PaymentProviderList"
import { useI18nContext } from "~i18n"
import { StatusBar, StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { ColorThemeType } from "~Constants"
import { useNavigation } from "@react-navigation/native"

export const BuyScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()

    return (
        <Layout
            hasSafeArea={false}
            noMargin
            noBackButton
            footer={
                <BaseButton
                    style={styles.button}
                    onPress={() => {
                        nav.goBack()
                    }}
                    action={function (): void {
                        throw new Error("Function not implemented.")
                    }}>
                    <BaseText
                        style={styles.buttonText}
                        typographyFont="bodyMedium">
                        {LL.BTN_GO_BACK()}
                    </BaseText>
                </BaseButton>
            }
            body={
                <BaseView style={styles.container}>
                    <BaseText style={styles.title} typographyFont="title">
                        {LL.TITLE_BUY()}
                    </BaseText>
                    <BaseSpacer height={10} />
                    <BaseText style={styles.subTitle}>
                        {LL.BD_SELECT_PAYMENT_PROVIDER()}
                    </BaseText>
                    <BaseSpacer height={20} />
                    <PaymentProviderList />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "column",
            marginTop: StatusBar.currentHeight || 0,
            marginHorizontal: 24,
            paddingTop: PlatformUtils.isIOS() ? 40 : 12,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
        },
        subTitle: {
            fontSize: 18,
            fontWeight: "bold",
            paddingTop: 20,
        },
        button: {
            marginHorizontal: 30,
            marginBottom: 40,
        },
        buttonText: {
            color: theme.colors.textReversed,
        },
    })
