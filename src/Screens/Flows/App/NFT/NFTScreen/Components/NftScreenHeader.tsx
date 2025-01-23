import React from "react"
import { BaseSpacer, BaseView, ChangeAccountButtonPill, HeaderTitle, SelectedNetworkViewer } from "~Components"
import { useI18nContext } from "~i18n"
import { HeaderStyle } from "~Constants"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseView style={HeaderStyle}>
            <HeaderTitle title={LL.TITLE_NFTS()} />
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <SelectedNetworkViewer />
                <BaseSpacer width={8} />
                <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
            </BaseView>
        </BaseView>
    )
}
