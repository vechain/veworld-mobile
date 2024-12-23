import React from "react"
import { BaseSpacer, BaseText, BaseView, ChangeAccountButtonPill, SelectedNetworkViewer } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseView flexDirection="row" justifyContent="space-between" mx={20} pb={8}>
            <BaseText typographyFont="subTitleMedium">{LL.TITLE_NFTS()}</BaseText>
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <SelectedNetworkViewer />
                <BaseSpacer width={8} />
                <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
            </BaseView>
        </BaseView>
    )
}
