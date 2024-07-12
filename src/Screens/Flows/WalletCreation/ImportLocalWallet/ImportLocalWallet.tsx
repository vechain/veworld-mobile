import React, { useCallback, useMemo, useRef, useState } from "react"
import {
    BackButtonHeader,
    BaseButton,
    BaseIcon,
    BaseModal,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    DismissKeyboardView,
    Layout,
    RequireUserPassword,
    SelectDerivationPathBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import * as Clipboard from "expo-clipboard"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useCheckIdentity,
    useCloudKit,
    useDeviceUtils,
    useTheme,
} from "~Hooks"
import { CryptoUtils } from "~Utils"
import { Keyboard, StyleSheet } from "react-native"
import { ImportWalletInput } from "./Components/ImportWalletInput"
import { selectAreDevFeaturesEnabled, selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import HapticsService from "~Services/HapticsService"
import { AnalyticsEvent } from "~Constants"
import { DEVICE_CREATION_ERRORS as ERRORS, IMPORT_TYPE } from "~Model"
import { UnlockKeystoreBottomSheet } from "./Components/UnlockKeystoreBottomSheet"
import { UserCreatePasswordScreen } from "../UserCreatePasswordScreen"
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

const DEMO_MNEMONIC = "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

enum ButtonType {
    local,
    icloud,
    unknown,
}

export const ImportLocalWallet = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const {
        onCreateWallet,
        importOnboardedWallet,
        isOpen,
        isError: isCreateError,
        onSuccess,
        onClose: onCloseCreateFlow,
    } = useHandleWalletCreation()

    const areDevFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const [textValue, setTextValue] = useState<string>("")
    const [isError, setIsError] = useState<string>("")

    const { checkCanImportDevice } = useDeviceUtils()

    const { isCloudKitAvailable } = useCloudKit()

    const computeButtonType = useMemo(() => {
        if (textValue.length) return ButtonType.local
        if (isCloudKitAvailable && !textValue.length) return ButtonType.icloud
        return ButtonType.unknown
    }, [isCloudKitAvailable, textValue.length])

    const {
        ref: unlockKeystoreBottomSheetRef,
        onOpen: openUnlockKeystoreBottomSheet,
        onClose: closeUnlockKeystoreBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: derivationPathRef,
        onOpen: onOpenDerivationPath,
        onClose: onCloseDerivationPath,
    } = useBottomSheetModal()

    const mnemonicCache = useRef<string[]>()
    const privateKeyCache = useRef<string>()

    const {
        isPasswordPromptOpen: isPasswordPromptOpen_1,
        handleClosePasswordModal: handleClosePasswordModal_1,
        onPasswordSuccess: onPasswordSuccess_1,
        checkIdentityBeforeOpening: checkIdentityBeforeOpening_1,
    } = useCheckIdentity({
        onIdentityConfirmed: async (pin?: string) => {
            await importOnboardedWallet({
                importMnemonic: mnemonicCache.current,
                privateKey: privateKeyCache.current,
                pin,
            })
            nav.goBack()
        },
        allowAutoPassword: false,
    })

    const importType = useMemo(() => CryptoUtils.determineKeyImportType(textValue), [textValue])

    const processErrorMessage = useCallback(
        (err: unknown) => {
            HapticsService.triggerNotification({ level: "Error" })
            const e = err as Error

            switch (e.message) {
                case ERRORS.INCORRECT_PASSWORD:
                    setIsError(LL.ERROR_INCORRECT_PASSWORD())
                    break
                case ERRORS.ADDRESS_EXISTS:
                    setIsError(LL.ERROR_IMPORT_ADDRESS_EXISTS())
                    break
                case ERRORS.INVALID_IMPORT_DATA:
                    setIsError(LL.ERROR_INVALID_IMPORT_DATA())
                    break
                default:
                    setIsError(LL.ERROR_IMPORT_GENERIC())
            }
        },
        [LL],
    )

    const importMnemonic = useCallback(
        (_mnemonic: string) => {
            try {
                const mnemonic = CryptoUtils.mnemonicStringToArray(_mnemonic)
                checkCanImportDevice(mnemonic)
                mnemonicCache.current = mnemonic
                track(AnalyticsEvent.IMPORT_MNEMONIC_SUBMITTED)
                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateWallet({ importMnemonic: mnemonic })
                }
            } catch (err) {
                processErrorMessage(err)
                track(AnalyticsEvent.IMPORT_MNEMONIC_FAILED)
            }
        },
        [
            checkCanImportDevice,
            track,
            userHasOnboarded,
            checkIdentityBeforeOpening_1,
            onCreateWallet,
            processErrorMessage,
        ],
    )

    const importPrivateKey = useCallback(
        (_privKey: string) => {
            try {
                checkCanImportDevice(undefined, _privKey)
                privateKeyCache.current = _privKey
                track(AnalyticsEvent.IMPORT_PRIVATE_KEY_SUBMITTED)
                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateWallet({ privateKey: _privKey })
                }
            } catch (err) {
                processErrorMessage(err)
                track(AnalyticsEvent.IMPORT_PRIVATE_KEY_FAILED)
            }
        },
        [
            checkCanImportDevice,
            track,
            userHasOnboarded,
            checkIdentityBeforeOpening_1,
            onCreateWallet,
            processErrorMessage,
        ],
    )

    const onUnlockKeyStoreFile = useCallback(
        async (pwd: string) => {
            try {
                const privateKey = await CryptoUtils.decryptKeystoreFile(textValue, pwd)
                checkCanImportDevice(undefined, privateKey)
                privateKeyCache.current = privateKey
                track(AnalyticsEvent.IMPORT_KEYSTORE_FILE_SUBMITTED)
                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateWallet({ privateKey })
                }
            } catch (err) {
                processErrorMessage(err)
                track(AnalyticsEvent.IMPORT_KEYSTORE_FILE_FAILED)
            }
        },
        [
            textValue,
            checkCanImportDevice,
            track,
            userHasOnboarded,
            checkIdentityBeforeOpening_1,
            onCreateWallet,
            processErrorMessage,
        ],
    )

    const onVerify = useCallback(
        (_textValue: string, _importType: string) => {
            try {
                switch (_importType) {
                    case IMPORT_TYPE.MNEMONIC:
                        importMnemonic(_textValue)
                        break
                    case IMPORT_TYPE.PRIVATE_KEY:
                        importPrivateKey(_textValue)
                        break
                    case IMPORT_TYPE.KEYSTORE_FILE:
                        openUnlockKeystoreBottomSheet()
                        break
                    default:
                        throw new Error("Unknown import type")
                }
            } catch (err) {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_INVALID_IMPORT_DATA())
            }
        },
        [importMnemonic, importPrivateKey, openUnlockKeystoreBottomSheet, LL],
    )

    const onDemoMnemonicClick = () => {
        setTextValue(DEMO_MNEMONIC)
        onVerify(DEMO_MNEMONIC, IMPORT_TYPE.MNEMONIC)
    }

    const onChangeText = (text: string) => {
        setIsError("")
        setTextValue(text)
    }

    const onPasteFromClipboard = async () => {
        setIsError("")
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            const _pastedText = await Clipboard.getStringAsync()
            onChangeText(_pastedText)

            HapticsService.triggerImpact({ level: "Light" })

            Keyboard.dismiss()
        }
    }

    const onClearSeed = () => {
        HapticsService.triggerImpact({ level: "Light" })
        setTextValue("")
        setIsError("")
    }

    const handleVerify = useCallback(() => onVerify(textValue, importType), [onVerify, textValue, importType])
    const disabledAction = useCallback(() => setIsError(LL.ERROR_INVALID_IMPORT_DATA()), [LL])

    return (
        <DismissKeyboardView>
            <Layout
                body={
                    <>
                        <BaseView justifyContent="space-between">
                            <BaseView>
                                <BaseView flexDirection="row" w={100}>
                                    <BaseText typographyFont="title">{LL.TITLE_WALLET_IMPORT_LOCAL()}</BaseText>
                                    {areDevFeaturesEnabled && (
                                        <BaseButton
                                            size="md"
                                            variant="link"
                                            action={onDemoMnemonicClick}
                                            title="DEV:DEMO"
                                        />
                                    )}
                                </BaseView>
                                <BaseText typographyFont="body" my={10}>
                                    {LL.BD_WALLET_IMPORT_LOCAL()}
                                </BaseText>

                                <BaseSpacer height={20} />

                                <BaseView flexDirection="row" alignSelf="flex-end">
                                    <BaseIcon
                                        name={"content-paste"}
                                        size={32}
                                        style={styles.icon}
                                        bg={theme.colors.secondary}
                                        action={onPasteFromClipboard}
                                    />
                                    <BaseIcon
                                        name={"trash-can-outline"}
                                        size={32}
                                        bg={theme.colors.secondary}
                                        action={onClearSeed}
                                    />
                                </BaseView>

                                <BaseSpacer height={40} />

                                <ImportWalletInput value={textValue} onChangeText={onChangeText} isError={!!isError} />

                                <BaseSpacer height={12} />

                                <BaseTouchableBox
                                    bg="transparent"
                                    haptics="Medium"
                                    action={onOpenDerivationPath}
                                    px={4}
                                    justifyContent="space-between">
                                    <BaseView flex={1}>
                                        <BaseText align="left" typographyFont="bodyBold">
                                            {"Derivation Path"}
                                        </BaseText>
                                    </BaseView>
                                    <BaseIcon name="chevron-right" size={24} color={theme.colors.text} />
                                </BaseTouchableBox>

                                <UnlockKeystoreBottomSheet
                                    ref={unlockKeystoreBottomSheetRef}
                                    onHide={closeUnlockKeystoreBottomSheet}
                                    onUnlock={onUnlockKeyStoreFile}
                                />
                                {!!isError && (
                                    <BaseText my={10} color={theme.colors.danger}>
                                        {isError}
                                    </BaseText>
                                )}
                            </BaseView>
                        </BaseView>

                        <SelectDerivationPathBottomSheet ref={derivationPathRef} onClose={onCloseDerivationPath} />

                        <BaseModal isOpen={isOpen} onClose={onCloseCreateFlow}>
                            <BaseView justifyContent="flex-start">
                                <BackButtonHeader action={onCloseCreateFlow} hasBottomSpacer={false} />
                                <UserCreatePasswordScreen
                                    onSuccess={pin =>
                                        onSuccess({
                                            pin,
                                            mnemonic: mnemonicCache.current,
                                            privateKey: privateKeyCache.current,
                                        })
                                    }
                                />
                            </BaseView>
                        </BaseModal>
                    </>
                }
                footer={
                    <BaseView w={100}>
                        {!!isCreateError && (
                            <BaseText my={10} color={theme.colors.danger}>
                                {isCreateError}
                            </BaseText>
                        )}

                        <BaseButton
                            action={async () =>
                                computeButtonType === ButtonType.icloud
                                    ? nav.navigate(Routes.IMPORT_FROM_CLOUD)
                                    : handleVerify()
                            }
                            w={100}
                            title={
                                computeButtonType === ButtonType.icloud
                                    ? "Or get from iCloud"
                                    : LL.BTN_IMPORT_WALLET_VERIFY()
                            }
                            disabled={computeButtonType === ButtonType.unknown}
                            disabledAction={disabledAction}
                            disabledActionHaptics="Heavy"
                        />

                        <RequireUserPassword
                            isOpen={isPasswordPromptOpen_1}
                            onClose={handleClosePasswordModal_1}
                            onSuccess={onPasswordSuccess_1}
                        />
                    </BaseView>
                }
            />
        </DismissKeyboardView>
    )
}

const styles = StyleSheet.create({
    icon: { marginHorizontal: 20 },
})
