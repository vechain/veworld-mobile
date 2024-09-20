import React, { useMemo } from "react"
import { AccountIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { BackupWallet, DEVICE_TYPE } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    onSelected: (selectedWallet: BackupWallet) => void
    wallet: BackupWallet
}

export const ListMnemonicCard = ({ onSelected, wallet }: Props) => {
    const { LL } = useI18nContext()

    const getType = useMemo(() => {
        switch (wallet.type) {
            case DEVICE_TYPE.LOCAL_MNEMONIC:
                return "Mnemonic"
            case DEVICE_TYPE.LOCAL_PRIVATE_KEY:
                return "Private Key"
            case DEVICE_TYPE.LOCAL_WATCHED:
                return "Watched"
            default:
                return LL.TYPE()
        }
    }, [LL, wallet.type])

    return (
        <BaseTouchableBox haptics="Light" action={() => onSelected(wallet)}>
            <BaseView flexDirection="row" flex={1} pr={10}>
                <AccountIcon address={wallet.rootAddress} />
                <BaseSpacer width={12} />

                <BaseView flex={1} flexDirection="row" justifyContent="space-between">
                    <BaseView>
                        <BaseText typographyFont="bodyBold" pb={4}>
                            {wallet.alias}
                        </BaseText>
                        <BaseText>{AddressUtils.humanAddress(wallet.rootAddress, 4, 4)}</BaseText>
                    </BaseView>

                    <BaseView alignItems="flex-end">
                        <BaseText typographyFont="bodyBold" pb={4}>
                            {LL.TYPE()}
                        </BaseText>
                        <BaseText>{getType}</BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseTouchableBox>
    )
}
