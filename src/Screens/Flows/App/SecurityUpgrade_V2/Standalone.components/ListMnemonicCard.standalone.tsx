import React from "react"
import { AccountIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Wallet } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    onSelected: (selectedWallet: Wallet) => void
    wallet: Wallet
}

export const ListMnemonicCard = ({ onSelected, wallet }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseTouchableBox haptics="Light" action={() => onSelected(wallet)}>
            <BaseView flexDirection="row" flex={1} pr={10}>
                <AccountIcon address={wallet.rootAddress} />
                <BaseSpacer width={12} />

                <BaseView flex={1}>
                    <BaseText typographyFont="bodyBold" pb={4}>
                        {LL.COMMON_ROOT_ADDRESS()}
                    </BaseText>
                    <BaseText>{AddressUtils.humanAddress(wallet.rootAddress, 4, 8)}</BaseText>
                </BaseView>
            </BaseView>
        </BaseTouchableBox>
    )
}
