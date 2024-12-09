import React from "react"
import { useTabBarBottomMargin, useTheme } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

export const NetworkErrorView = () => {
    const { iosOnlyTabBarBottomMargin } = useTabBarBottomMargin()
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <BaseView
            flexDirection="column"
            justifyContent="space-evenly"
            alignItems="center"
            style={{ marginBottom: iosOnlyTabBarBottomMargin }}
            px={24}
            w={100}>
            <BaseIcon name="alert-circle-outline" color={theme.colors.text} size={72} />
            <BaseSpacer height={24} />
            <BaseText typographyFont="subSubTitleMedium">{LL.COMMON_WHOOPS()}</BaseText>
            <BaseSpacer height={8} />
            <BaseText typographyFont="body" align="center">
                {LL.NFT_DOWNLOAD_ERROR()}
            </BaseText>
        </BaseView>
    )
}
