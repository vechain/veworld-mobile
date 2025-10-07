import React from "react"
import {
    BaseSpacer,
    BaseView,
    ChangeAccountButtonPill,
    HeaderTitle,
    SelectedNetworkViewer,
    HeaderStyleV2,
} from "~Components"
import { NetworkSwitcherContextMenu } from "~Components/Reusable/ContextMenu"
import { useI18nContext } from "~i18n"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseView style={HeaderStyleV2}>
            <HeaderTitle testID="nfts_title" title={LL.TITLE_NFTS()} leftIconName="icon-image" />
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <NetworkSwitcherContextMenu>
                    <SelectedNetworkViewer />
                </NetworkSwitcherContextMenu>
                <BaseSpacer width={8} />
                <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
            </BaseView>
        </BaseView>
    )
}
