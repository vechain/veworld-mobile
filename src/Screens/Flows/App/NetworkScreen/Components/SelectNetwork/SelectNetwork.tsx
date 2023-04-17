import React from "react"
import { BaseSpacer, BaseText, NetworkBox } from "~Components"
import { useI18nContext } from "~i18n"
import { Network } from "~Model"

type Props = {
    openBottomSheet: () => void
    selectedNetwork: Network
}
export const SelectNetwork: React.FC<Props> = ({
    selectedNetwork,
    openBottomSheet,
}) => {
    const { LL } = useI18nContext()
    return (
        <>
            <BaseText typographyFont="title">{LL.TITLE_NETWORKS()}</BaseText>
            <BaseSpacer height={24} />
            <BaseText typographyFont="bodyMedium">
                {LL.BD_SELECT_NETWORK()}
            </BaseText>
            <BaseSpacer height={8} />

            <BaseText typographyFont="captionRegular">
                {LL.BD_SELECT_NETWORK_DESC()}
            </BaseText>

            <BaseSpacer height={16} />

            <NetworkBox
                network={selectedNetwork}
                onPress={openBottomSheet}
                rightIcon="magnify"
            />
        </>
    )
}
