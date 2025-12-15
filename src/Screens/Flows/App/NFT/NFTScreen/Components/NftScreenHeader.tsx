import React from "react"
import { BaseView, ChangeAccountButtonPill, HeaderStyleV2, HeaderTitle } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseView style={HeaderStyleV2}>
            <HeaderTitle testID="nfts_title" title={LL.TITLE_NFTS()} leftIconName="icon-image" align="left" />
            <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
        </BaseView>
    )
}
