import React, { useCallback, useState } from "react"
import { BackButtonHeader, BaseButton, BaseView } from "~Components"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { SafeAreaView } from "react-native-safe-area-context"
import { RootStackParamListBackupWallet } from "../Navigation.standalone"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Routes } from "~Navigation"
import { useWalletSecurity } from "../Helpers.standalone"
import { Wallet } from "~Model"
import { WalletsList } from "./WalletsList.standalone"
import { MnemonicModalSheetStandalone } from "./MnemonicModalSheet.standalone"
interface Props
    extends NativeStackScreenProps<RootStackParamListBackupWallet, Routes.SECURITY_UPGRADE_V2_MNEMONIC_BACKUP> {
    upgradeSecurityToV2: (password?: string) => Promise<void>
}

export const MnemonicBackup = ({ route, upgradeSecurityToV2 }: Props) => {
    const { wallets, oldPersistedState, securityType, pin } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { isWalletSecurityBiometrics, isWalletSecurityPassword } = useWalletSecurity(securityType)
    const { ref, openWithDelay } = useBottomSheetModal()

    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)

    const handleOnSelectedWallet = useCallback(
        (_selectedWallet: Wallet) => {
            setSelectedWallet(_selectedWallet)
            openWithDelay(200)
        },
        [openWithDelay],
    )

    const onStartUpgrade = useCallback(async () => {
        if (isWalletSecurityPassword) upgradeSecurityToV2(pin)
        if (oldPersistedState && isWalletSecurityBiometrics) await upgradeSecurityToV2()
    }, [isWalletSecurityBiometrics, isWalletSecurityPassword, oldPersistedState, pin, upgradeSecurityToV2])

    return (
        <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
            <BackButtonHeader />
            <BaseView justifyContent="space-between" h={100} w={100}>
                <BaseView w={100} h={75}>
                    <WalletsList wallets={wallets} onSelected={handleOnSelectedWallet} />
                </BaseView>
                <BaseView w={100} h={25} p={24}>
                    <BaseButton title={LL.SECURITY_UPGRADE_BTN()} w={100} radius={8} action={onStartUpgrade} />
                </BaseView>
            </BaseView>
            <MnemonicModalSheetStandalone ref={ref} selectedWallet={selectedWallet} />
        </SafeAreaView>
    )
}
