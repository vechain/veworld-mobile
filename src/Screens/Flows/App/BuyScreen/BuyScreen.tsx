import React from "react"
import { BaseSpacer, BaseText, BaseView, Layout } from "~Components"
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
            title={LL.TITLE_BUY()}
            fixedBody={
                <BaseView
                    flex={1}
                    flexDirection="column"
                    mt={StatusBar.currentHeight ?? 0}
                    pt={PlatformUtils.isIOS() ? 0 : 12}
                    mx={16}>
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
