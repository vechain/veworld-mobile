import React from "react"
import { BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import { PaymentProviderList } from "./Components"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"

const isAndroid = PlatformUtils.isAndroid()

export const BuyScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <Layout
            hasSafeArea={isAndroid}
            title={LL.TITLE_BUY()}
            bg={theme.isDark ? COLORS.PURPLE : COLORS.WHITE}
            fixedBody={
                <BaseView flex={1} flexDirection="column" mx={24}>
                    <BaseText typographyFont="body" pt={26} color={theme.colors.subtitle}>
                        {LL.BD_SELECT_PAYMENT_PROVIDER()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <PaymentProviderList />
                </BaseView>
            }
        />
    )
}
