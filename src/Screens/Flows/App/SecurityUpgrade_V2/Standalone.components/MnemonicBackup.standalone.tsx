import React from "react"
import { BackButtonHeader, BaseButton, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { useCopyClipboard, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Wallet } from "~Model"
import { MnemonicCard } from "./MnemonicCard.standalone"
import { SafeAreaView } from "react-native-safe-area-context"

type Props = {
    wallet: Wallet | null
}

export const MnemonicBackup = ({ wallet }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
            <BackButtonHeader />
            <BaseView justifyContent="space-between" h={100} w={100} px={24} pb={24}>
                <BaseView>
                    <BaseText typographyFont="biggerTitle" align="center">
                        {LL.BTN_BACKUP_MENMONIC()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseView justifyContent="center">
                        <BaseText typographyFont="body">{LL.BD_MNEMONIC_WARMNING()}</BaseText>

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
                <BaseView w={100}>
                    <BaseButton title="I've backed up the phrase!" w={100} radius={8} action={() => {}} />
                </BaseView>
            </BaseView>
        </SafeAreaView>
    )
}
