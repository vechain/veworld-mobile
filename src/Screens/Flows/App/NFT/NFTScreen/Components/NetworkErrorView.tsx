import React from "react"
import { usePlatformBottomInsets } from "~Hooks"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

export const NetworkErrorView = () => {
    const { iosSpecificBottomInsetsIfIos } = usePlatformBottomInsets()
    const { LL } = useI18nContext()

    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-evenly"
            style={{ marginBottom: iosSpecificBottomInsetsIfIos }}
            px={20}
            w={100}>
            <BaseText>{LL.NFT_DOWNLOAD_ERROR()}</BaseText>
        </BaseView>
    )
}
