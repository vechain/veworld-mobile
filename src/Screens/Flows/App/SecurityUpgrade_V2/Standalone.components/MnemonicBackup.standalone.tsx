import React from "react"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { useCopyClipboard, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Wallet } from "~Model"
import { MnemonicCard } from "./MnemonicCard.standalone"

type Props = {
    wallet: Wallet | null
    onClose: () => void
}

export const MnemonicBackup = ({ wallet }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseView bg={theme.colors.background} px={24} h={100}>
            <BaseView flexDirection="row" w={100} pt={12}>
                <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseView justifyContent="center">
                <BaseText>{LL.BD_MNEMONIC_WARMNING()}</BaseText>

                <BaseSpacer height={36} />
            </BaseView>

            <BaseView alignItems="flex-start" mb={16}>
                {!!wallet?.mnemonic?.length && <MnemonicCard mnemonicArray={wallet.mnemonic} />}
                <BaseSpacer height={16} />

                <BaseTouchable
                    underlined
                    title={LL.BTN_MNEMONIC_CLIPBOARD()}
                    onPress={() => onCopyToClipboard(wallet!.mnemonic!.join(" "), LL.BD_BACKUP_MNEMONIC())}
                />
            </BaseView>
        </BaseView>
    )
}
