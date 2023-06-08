import React, { useMemo } from "react"
import { BaseText, BaseView, ChangeAccountButtonPill } from "~Components"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { FormattingUtils } from "~Utils"
import { useI18nContext } from "~i18n"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const humanAddress = useMemo(
        () => FormattingUtils.humanAddress(selectedAccount.address ?? "", 5, 4),
        [selectedAccount.address],
    )

    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-between"
            mx={20}
            pb={12}>
            <BaseText typographyFont="largeTitle">{LL.TITLE_NFTS()}</BaseText>

            <ChangeAccountButtonPill
                title={selectedAccount.alias ?? LL.WALLET_LABEL_ACCOUNT()}
                text={humanAddress}
                action={openSelectAccountBottomSheet}
            />
        </BaseView>
    )
}
