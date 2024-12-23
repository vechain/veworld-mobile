import React from "react"
import { BackButtonHeader, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { StatusBar } from "react-native"
import { PlatformUtils } from "~Utils"
import { PaymentProviderList } from "./Components"

const isAndroid = PlatformUtils.isAndroid()

export const BuyScreen = () => {
    const { LL } = useI18nContext()

    return (
        <Layout
            hasSafeArea={isAndroid}
            noBackButton
            noMargin
            fixedHeader={
                <BaseView px={24}>
                    <BaseSpacer height={8} />
                    <BackButtonHeader hasBottomSpacer={false} title={LL.TITLE_BUY()} />
                    <BaseSpacer height={8} />
                </BaseView>
            }
            fixedBody={
                <BaseView
                    flex={1}
                    flexDirection="column"
                    mt={StatusBar.currentHeight ?? 0}
                    pt={PlatformUtils.isIOS() ? 40 : 12}
                    mx={24}>
                    <BaseText fontSize={18} fontWeight="bold" pt={20}>
                        {LL.BD_SELECT_PAYMENT_PROVIDER()}
                    </BaseText>
                    <BaseSpacer height={20} />
                    <PaymentProviderList />
                </BaseView>
            }
        />
    )
}
