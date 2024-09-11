import React, { useCallback } from "react"
import { BackButtonHeader, BaseButton, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { useCopyClipboard, useDisclosure, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { MnemonicCard } from "./MnemonicCard.standalone"
import { SafeAreaView } from "react-native-safe-area-context"
import { RootStackParamListBackupWallet } from "../Navigation.standalone"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Routes } from "~Navigation"
import { BaseModalWithChildren } from "./BaseModal.standalone"
import { LockScreen } from "./LockScreen.standalone"
import { useWalletSecurity } from "../Helpers.standalone"
interface Props
    extends NativeStackScreenProps<RootStackParamListBackupWallet, Routes.SECURITY_UPGRADE_V2_MNEMONIC_BACKUP> {}

export const MnemonicBackup = ({ route }: Props) => {
    const { wallet, oldPersistedState, securityType, upgradeSecurityToV2 } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { onCopyToClipboard } = useCopyClipboard()

    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const { isWalletSecurityBiometrics, isWalletSecurityPassword } = useWalletSecurity(securityType)

    const onPasswordSuccess = useCallback(
        (pin: string) => {
            closePasswordPrompt()
            upgradeSecurityToV2(pin)
        },
        [closePasswordPrompt, upgradeSecurityToV2],
    )

    const onStartUpgrade = useCallback(async () => {
        if (isWalletSecurityPassword) openPasswordPrompt()
        if (oldPersistedState && isWalletSecurityBiometrics) await upgradeSecurityToV2()
    }, [
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        oldPersistedState,
        openPasswordPrompt,
        upgradeSecurityToV2,
    ])

    return (
        <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
            <BackButtonHeader />
            <BaseView justifyContent="space-between" alignItems="center" h={100} w={100} p={24}>
                <BaseView w={100}>
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

                <BaseView w={100} h={20}>
                    <BaseButton title="I've backed up the phrase!" w={100} radius={8} action={onStartUpgrade} />
                </BaseView>
            </BaseView>
            <BaseModalWithChildren isOpen={isPasswordPromptOpen} onClose={closePasswordPrompt}>
                <LockScreen onSuccess={onPasswordSuccess} />
            </BaseModalWithChildren>
        </SafeAreaView>
    )
}
