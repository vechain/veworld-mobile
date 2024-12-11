import { useNavigation } from "@react-navigation/native"
import { isEmpty, isUndefined } from "lodash"
import React, { useCallback, useRef, useState } from "react"
import { Modal, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, MigrationToSecurity_v2 } from "~Components"
import { useBackHandler, useDisclosure, useTheme } from "~Hooks"
import { BackHandlerEvent, BackupWallet, SecurityLevelType } from "~Model"
import { Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { useWalletSecurity } from "./Helpers.standalone"
import { BaseModalWithChildren, LockScreen } from "./Standalone.components"

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
    const [_isOnlyLedger, setisOnlyLedger] = useState(false)
    const [_isOnlyPk, setisOnlyPk] = useState(false)

    const { isWalletSecurityBiometrics, isWalletSecurityPassword, isWalletSecurityNone } =
        useWalletSecurity(securityType)

    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()
    const { isOpen: isExtraModalOpen, onOpen: openExtraModal, onClose: closeExtraModal } = useDisclosure()

    const navigateToBackupScreen = useCallback(
        (wallets: BackupWallet[], _password?: string) => {
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
        closeExtraModal()
        if (isWalletSecurityNone) throw new Error("No security set")
        if (isWalletSecurityPassword) openPasswordPrompt()
        isUpgrade.current = false
        if (oldPersistedState && isWalletSecurityBiometrics) {
            const { isOnlyLedger, inOnlyPrivateKey, localWallets } =
                await MigrationToSecurity_v2.getMnemonicsFromStorage(oldPersistedState)

            if (isOnlyLedger) {
                setisOnlyLedger(true)
                return
            }

            if (inOnlyPrivateKey) {
                setisOnlyPk(true)
                return
            }

            if (isEmpty(localWallets) || isUndefined(localWallets)) return

            let validWallets: BackupWallet[] = []
            for (let wallet of localWallets) {
                if (wallet.mnemonic) validWallets.push(wallet)
            }
            navigateToBackupScreen(localWallets)
        }
    }, [
        isWalletSecurityNone,
        isWalletSecurityPassword,
        openPasswordPrompt,
        oldPersistedState,
        isWalletSecurityBiometrics,
        navigateToBackupScreen,
        closeExtraModal,
    ])

    const onPasswordSuccess = useCallback(
        async (_password: string) => {
            if (oldPersistedState) {
                closePasswordPrompt()
                const { isOnlyLedger, inOnlyPrivateKey, localWallets } =
                    await MigrationToSecurity_v2.getMnemonicsFromStorage(oldPersistedState, _password)

                if (isOnlyLedger) {
                    setisOnlyLedger(true)
                    return
                }

                if (inOnlyPrivateKey) {
                    setisOnlyPk(true)
                    return
                }

                if (isEmpty(localWallets) || isUndefined(localWallets)) return

                let validWallets: BackupWallet[] = []
                for (let wallet of localWallets) {
                    if (wallet.mnemonic) validWallets.push(wallet)
                }
                navigateToBackupScreen(localWallets, _password)
            }
        },
        [oldPersistedState, closePasswordPrompt, navigateToBackupScreen],
    )

    const onStartUpgrade = useCallback(async () => {
        closeExtraModal()
        isUpgrade.current = true

        if (isWalletSecurityPassword) openPasswordPrompt()
        if (oldPersistedState && isWalletSecurityBiometrics) await upgradeSecurityToV2()
    }, [
        isWalletSecurityBiometrics,
        isWalletSecurityPassword,
        oldPersistedState,
        openPasswordPrompt,
        upgradeSecurityToV2,
        closeExtraModal,
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
                    <BaseIcon name="icon-shield-alert" size={72} color={theme.colors.text} />
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
                    {(_isOnlyLedger || _isOnlyPk) && (
                        <BaseView w={100} pb={14}>
                            <BaseText align="center" typographyFont="caption" color={theme.colors.danger}>
                                {_isOnlyLedger ? LL.SECURITY_UPGRADE_ONLY_HARDWARE() : LL.SECURITY_UPGRADE_ONLY_PK()}
                            </BaseText>
                        </BaseView>
                    )}

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
                            disabled={_isOnlyLedger || _isOnlyPk}
                        />
                    </BaseView>

                    <BaseView w={100}>
                        <BaseButton
                            title={LL.SECURITY_UPGRADE_BTN()}
                            w={100}
                            radius={8}
                            action={
                                (_isOnlyLedger ? onStartUpgrade : openExtraModal) ||
                                (_isOnlyPk ? onStartUpgrade : openExtraModal)
                            }
                        />
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

            <Modal animationType="slide" transparent={true} visible={isExtraModalOpen} onRequestClose={closeExtraModal}>
                <View style={styles.endView}>
                    <View style={[styles.modalView, { backgroundColor: theme.colors.card }]}>
                        <BaseText align="center" typographyFont="subSubTitle">
                            {LL.SECURITY_UPGRADE_REMINDER()}
                        </BaseText>

                        <BaseSpacer height={8} />

                        <BaseText align="center" typographyFont="caption">
                            {LL.SECURITY_UPGRADE_REMINDER_DESC()}
                        </BaseText>

                        <View style={styles.innerButtonContainer}>
                            <BaseButton
                                w={100}
                                radius={8}
                                title={LL.SECURITY_BACKUP_BTN()}
                                variant="outline"
                                action={onBackupHandler}
                                disabled={_isOnlyLedger || _isOnlyPk}
                            />

                            <BaseSpacer height={14} />
                            <BaseButton title={"Upgrade"} w={100} radius={8} action={onStartUpgrade} />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    endView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    modalView: {
        width: "100%",
        height: "40%",
        borderRadius: 20,
        padding: 24,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,

        alignItems: "center",
    },
    innerButtonContainer: { flexGrow: 1, width: "100%", justifyContent: "flex-end", paddingBottom: 12 },
})
