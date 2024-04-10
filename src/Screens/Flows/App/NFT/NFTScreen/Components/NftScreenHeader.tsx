import React from "react"
import { BaseSpacer, BaseText, BaseView, ChangeAccountButtonPill, SelectedNetworkViewer } from "~Components"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    return (
        <BaseView flexDirection="row" justifyContent="space-between" mx={20} pb={16}>
            <BaseText typographyFont="largeTitle">{LL.TITLE_NFTS()}</BaseText>
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <SelectedNetworkViewer />
                <BaseSpacer width={8} />
                <ChangeAccountButtonPill
                    title={selectedAccount.alias ?? LL.WALLET_LABEL_ACCOUNT()}
                    text={selectedAccount.address}
                    action={openSelectAccountBottomSheet}
                />
            </BaseView>
        </BaseView>
    )
}
