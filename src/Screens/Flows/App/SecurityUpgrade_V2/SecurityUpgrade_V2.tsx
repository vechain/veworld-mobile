import React, { useCallback, useRef, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { BaseButton, BaseSpacer, BaseText, BaseView, MigrationToSecurity_v2 } from "~Components"
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
            <BaseView justifyContent="space-between" alignItems="center" h={100}>
                <BaseView alignItems="center">
                    <BaseText>{"SecurityUpgrade_V2"}</BaseText>

                    <BaseSpacer height={69} />

                    <BaseText>{"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam."}</BaseText>

                    <BaseSpacer height={69} />

                    <BaseButton title="BACKUP NOW" action={getWalletsWithUserAuthentication} />
                </BaseView>

                <BaseView pb={62}>
                    <BaseButton title="Upgrade Security" action={onStartUpgrade} />
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
