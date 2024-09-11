import React, { useCallback, useRef, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, MigrationToSecurity_v2 } from "~Components"
import { useBackHandler, useDisclosure, useTheme } from "~Hooks"
import { BackHandlerEvent, SecurityLevelType, Wallet } from "~Model"
import { useWalletSecurity } from "./Helpers.standalone"
import { BaseModalWithChildren, LockScreen, MnemonicBackup, WalletsList } from "./Standalone.components"

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
    useBackHandler(BackHandlerEvent.BLOCK)

    const [wallets, setWallets] = useState<Wallet[] | []>([])
    const isUpgrade = useRef(false)

    const { isWalletSecurityBiometrics, isWalletSecurityPassword, isWalletSecurityNone } =
        useWalletSecurity(securityType)

    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()
    const { isOpen: isWalletListOpen, onOpen: onOpenWalletList, onClose: onCloseWalletList } = useDisclosure()
    const { isOpen: isWalletBackupOpen, onOpen: onOpenWalletBackup, onClose: onCloseWalletBackup } = useDisclosure()

    const getWalletsWithUserAuthentication = useCallback(async () => {
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
            setWallets(_wallets ?? [])
            if (_wallets.length > 1) {
                onOpenWalletList()
            } else {
                onOpenWalletBackup()
            }
        }
    }, [
        isWalletSecurityNone,
        isWalletSecurityPassword,
        openPasswordPrompt,
        oldPersistedState,
        isWalletSecurityBiometrics,
        onOpenWalletList,
        onOpenWalletBackup,
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
                setWallets(_wallets ?? [])
                if (_wallets.length > 1) {
                    onOpenWalletList()
                } else {
                    onOpenWalletBackup()
                }
            }
        },
        [oldPersistedState, closePasswordPrompt, onOpenWalletList, onOpenWalletBackup],
    )

    const [selectedWalletToBackup, setSelectedWalletToBackup] = useState<Wallet | null>(null)
    const handleOnSelectedWallet = useCallback(
        (selectedWallet: Wallet) => {
            onCloseWalletList()
            setSelectedWalletToBackup(selectedWallet)
            onOpenWalletBackup()
        },
        [onOpenWalletBackup, onCloseWalletList],
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
                    <BaseIcon name="shield-alert-outline" size={72} />
                    <BaseSpacer height={24} />
                    <BaseText align="center" fontSize={24} fontWeight="600">
                        {"Security Enhancement"}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <BaseText align="center" fontSize={12} fontWeight={"400"}>
                        {
                            // eslint-disable-next-line max-len
                            "Our wallet has always met the highest standards, and now we're taking it a step further. To keep your assets even more secure, please upgrade your wallet."
                        }
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
                        style={{ borderWidth: 1, borderColor: theme.colors.border }}>
                        <BaseText align="center" fontSize={14} fontWeight="600">
                            {"Backup phrase"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText align="center" fontSize={12} fontWeight="400">
                            {
                                // eslint-disable-next-line max-len
                                "Before proceeding with the upgrade, please backup your recovery phrase if you haven’t done it yet."
                            }
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseButton
                            title="Backup Now"
                            size="sm"
                            py={11}
                            radius={8}
                            variant="outline"
                            action={getWalletsWithUserAuthentication}
                        />
                    </BaseView>
                    <BaseView w={100}>
                        <BaseButton title="Upgrade Security" w={100} action={onStartUpgrade} />
                    </BaseView>
                </BaseView>
            </BaseView>

            <BaseModalWithChildren isOpen={isWalletListOpen} onClose={onCloseWalletList}>
                <WalletsList wallets={wallets} onSelected={handleOnSelectedWallet} />
            </BaseModalWithChildren>

            <BaseModalWithChildren isOpen={isWalletBackupOpen} onClose={onCloseWalletBackup}>
                <MnemonicBackup
                    wallet={wallets.length > 1 ? selectedWalletToBackup : wallets[0]}
                    onClose={onCloseWalletBackup}
                />
            </BaseModalWithChildren>

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
