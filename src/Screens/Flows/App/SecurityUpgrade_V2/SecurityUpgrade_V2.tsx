import React, { useCallback, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, MigrationToSecurity_v2 } from "~Components"
import { useBackHandler, useDisclosure, useTheme } from "~Hooks"
import { BackHandlerEvent, SecurityLevelType, Wallet } from "~Model"
import { useWalletSecurity } from "./Helpers.standalone"
import { BaseModalWithChildren, LockScreen } from "./Standalone.components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"

export const SecurityUpgrade_V2 = ({
    oldPersistedState,
    securityType,
    upgradeSecurityToV2,
}: {
    oldPersistedState?: string
    securityType: SecurityLevelType
    upgradeSecurityToV2: (password?: string) => Promise<void>
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    useBackHandler(BackHandlerEvent.BLOCK)

    const isUpgrade = useRef(false)

    const { isWalletSecurityBiometrics, isWalletSecurityPassword, isWalletSecurityNone } =
        useWalletSecurity(securityType)

    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const navigateToBackupScreen = useCallback(
        (wallets: Wallet[], _password?: string) => {
            nav.navigate(Routes.SECURITY_UPGRADE_V2_MNEMONIC_BACKUP, {
                wallets,
                oldPersistedState,
                securityType,
                pin: _password,
            })
        },
        [nav, oldPersistedState, securityType],
    )

    const onBackupHandler = useCallback(async () => {
        if (isWalletSecurityNone) throw new Error("No security set")
        if (isWalletSecurityPassword) openPasswordPrompt()
        isUpgrade.current = false
        if (oldPersistedState && isWalletSecurityBiometrics) {
            const _wallets = await MigrationToSecurity_v2.getMnemonicsFromStorage(oldPersistedState)
            if (!_wallets) return
            let validWallets: Wallet[] = []
            for (let wallet of _wallets) {
                if (wallet.mnemonic) validWallets.push(wallet)
            }
            navigateToBackupScreen(_wallets)
        }
    }, [
        isWalletSecurityNone,
        isWalletSecurityPassword,
        openPasswordPrompt,
        oldPersistedState,
        isWalletSecurityBiometrics,
        navigateToBackupScreen,
    ])

    const onPasswordSuccess = useCallback(
        async (_password: string) => {
            if (oldPersistedState) {
                closePasswordPrompt()
                const _wallets = await MigrationToSecurity_v2.getMnemonicsFromStorage(oldPersistedState, _password)
                if (!_wallets) return
                let validWallets: Wallet[] = []
                for (let wallet of _wallets) {
                    if (wallet.mnemonic) validWallets.push(wallet)
                }
                navigateToBackupScreen(_wallets, _password)
            }
        },
        [oldPersistedState, closePasswordPrompt, navigateToBackupScreen],
    )

    const onStartUpgrade = useCallback(async () => {
        isUpgrade.current = true

        if (isWalletSecurityPassword) openPasswordPrompt()
        if (oldPersistedState && isWalletSecurityBiometrics) await upgradeSecurityToV2()
    }, [
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        oldPersistedState,
        openPasswordPrompt,
        upgradeSecurityToV2,
    ])

    const onPasswordUpgradeSuccess = useCallback(
        async (pin: string) => {
            if (oldPersistedState) {
                await upgradeSecurityToV2(pin)
            }
        },
        [oldPersistedState, upgradeSecurityToV2],
    )

    return (
        <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
            <BaseView justifyContent="space-between" alignItems="center" h={100} w={100} p={24}>
                <BaseView alignItems="center">
                    <BaseIcon name="shield-alert-outline" size={72} color={theme.colors.text} />
                    <BaseSpacer height={24} />
                    <BaseText align="center" typographyFont="title">
                        {LL.SECURITY_ENHANCEMENT_TITLE()}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <BaseText align="center" typographyFont="caption">
                        {LL.SECURITY_ENHANCEMENT_DESC()}
                    </BaseText>

                    <BaseSpacer height={69} />
                </BaseView>
                <BaseView w={100}>
                    <BaseView
                        w={100}
                        p={24}
                        mb={24}
                        borderRadius={16}
                        //eslint-disable-next-line react-native/no-inline-styles
                        style={{ borderWidth: 1, borderColor: theme.colors.card }}>
                        <BaseText align="center" typographyFont="subSubTitle">
                            {LL.SECURITY_BACKUP_TITLE()}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText align="center" typographyFont="caption">
                            {LL.SECURITY_BACKUP_DESC()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseButton
                            title={LL.SECURITY_BACKUP_BTN()}
                            size="sm"
                            py={11}
                            radius={8}
                            variant="outline"
                            action={onBackupHandler}
                        />
                    </BaseView>
                    <BaseView w={100}>
                        <BaseButton title={LL.SECURITY_UPGRADE_BTN()} w={100} radius={8} action={onStartUpgrade} />
                    </BaseView>
                </BaseView>
            </BaseView>

            <BaseModalWithChildren isOpen={isPasswordPromptOpen} onClose={closePasswordPrompt}>
                <LockScreen
                    onSuccess={(pin: string) =>
                        isUpgrade.current ? onPasswordUpgradeSuccess(pin) : onPasswordSuccess(pin)
                    }
                />
            </BaseModalWithChildren>
        </SafeAreaView>
    )
}
