import React from "react"
import { BackButtonHeader, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { StatusBar } from "react-native"
import { PlatformUtils } from "~Utils"
import { PaymentProviderList } from "./Components"

export const BuyScreen = () => {
    const { LL } = useI18nContext()

    return (
        <Layout
            hasSafeArea={!PlatformUtils.isIOS()}
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
                <BaseView
                    flex={1}
                    flexDirection="column"
                    mt={StatusBar.currentHeight ?? 0}
                    pt={PlatformUtils.isIOS() ? 40 : 12}
                    mx={24}>
                    <BaseText fontSize={24} fontWeight="bold" typographyFont="title">
                        {LL.TITLE_BUY()}
                    </BaseText>
                    <BaseSpacer height={10} />
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
