import React from "react"
import {
    BackButtonHeader,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import { StatusBar, StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { ColorThemeType } from "~Constants"
import { PaymentProviderList } from "./Components/PaymentProviderList/PaymentProviderList"

export const BuyScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <Layout
            hasSafeArea={PlatformUtils.isIOS() ? false : true}
            noBackButton
            noMargin
            fixedHeader={
                <>
                    <BaseSpacer height={16} />
                    <BackButtonHeader hasBottomSpacer={false} />
                    <BaseSpacer height={8} />
                </>
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
