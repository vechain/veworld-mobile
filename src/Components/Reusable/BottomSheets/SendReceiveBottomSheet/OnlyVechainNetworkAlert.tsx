import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { StackedImages } from "~Components/Reusable/StackedImages"
import { B3TR, COLORS, VET, VTHO } from "~Constants"
import { useI18nContext } from "~i18n"

export const OnlyVechainNetworkAlert = () => {
    const { LL } = useI18nContext()
    return (
        <BaseView flexDirection="row" gap={12}>
            <BaseIcon name="icon-info" size={16} color={COLORS.BLUE_200} />
            <BaseText typographyFont="captionMedium" color={COLORS.BLUE_200}>
                {LL.NETWORK_WARNING_QR_CODE_FOR_ACCOUNT()}
            </BaseText>
            <StackedImages uris={[B3TR.icon, VET.icon, VTHO.icon]} maxImagesBeforeCompression={10} />
        </BaseView>
    )
}
