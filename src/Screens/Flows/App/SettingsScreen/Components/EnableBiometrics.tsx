import React, { useCallback, useMemo } from "react"
import { Switch } from "react-native"
import {
    AppUnlockFlow,
    BiometricsUtils,
    CryptoUtils,
    PasswordUtils,
    useDisclosure,
    useUnlockFlow,
} from "~Common"
import { encryptWallet } from "~Common/Utils/CryptoUtils/CryptoUtils"
import { BaseText, BaseView } from "~Components"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import {
    Biometrics,
    Config,
    Device,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"
import { RequireUserPassword } from "../../HomeScreen/Components"

export const EnableBiometrics = () => {
    const store = useStore()
    const cache = useCache()

    const unlockFlow = useUnlockFlow()
    // todo: this is a workaround until the new version is installed
    const result = useStoreQuery(Config)
    const config = useMemo(() => result.sorted("_id"), [result])

    const biometricsQuery = useCachedQuery(Biometrics)
    const biometrics = useMemo(
        () => biometricsQuery.sorted("_id"),
        [biometricsQuery],
    )

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const deviceQuery = useStoreQuery(Device)
    const devices = useMemo(
        () => deviceQuery.sorted("rootAddress"),
        [deviceQuery],
    )

    const isEnabled = useMemo(
        () => unlockFlow === AppUnlockFlow.BIO_UNLOCK,
        [unlockFlow],
    )

    const requireBiometricsAndEnableIt = useCallback(async () => {
        let { success } = await BiometricsUtils.authenticateWithbiometric()
        if (success) openPasswordPrompt()
    }, [openPasswordPrompt])

    const enableBiometrics = useCallback(
        async (password: string) => {
            store.beginTransaction()

            for (const device of devices) {
                let encryptedKey = await KeychainService.getEncryptionKey(
                    device.index,
                    isEnabled,
                )
                if (encryptedKey) {
                    const decryptedKey = CryptoUtils.decrypt<string>(
                        encryptedKey,
                        PasswordUtils.hash(password),
                    )
                    let _wallet = CryptoUtils.decrypt<Wallet>(
                        device.wallet,
                        decryptedKey,
                    )
                    console.log(device.wallet)

                    const { encryptedWallet: updatedEncryptedWallet } =
                        await encryptWallet(_wallet, device.index, true)

                    console.log("encrypted", encryptWallet)
                    device.wallet = updatedEncryptedWallet

                    console.log("\n", updatedEncryptedWallet)
                } else {
                    console.log(`No key for ${device.alias}`)
                }
            }
            config[0].userSelectedSecurtiy = UserSelectedSecurityLevel.BIOMETRIC
            store.commitTransaction()
            cache.write(() => (biometrics[0].accessControl = true))
            closePasswordPrompt()
        },
        [
            store,
            cache,
            config,
            biometrics,
            devices,
            isEnabled,
            closePasswordPrompt,
        ],
    )

    return (
        <>
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={enableBiometrics}
            />
            <BaseView
                justify="space-between"
                w={100}
                align="center"
                orientation="row">
                <BaseText>Enable Biometrics</BaseText>
                <Switch
                    disabled={isEnabled}
                    onValueChange={requireBiometricsAndEnableIt}
                    value={isEnabled}
                />
            </BaseView>
        </>
    )
}
