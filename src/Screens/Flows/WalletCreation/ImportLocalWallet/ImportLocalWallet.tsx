import React, { useCallback, useMemo, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import * as Clipboard from "expo-clipboard"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useDeviceUtils,
    useTheme,
} from "~Hooks"
import { CryptoUtils, error } from "~Utils"
import { Keyboard, StyleSheet } from "react-native"
import { Routes } from "~Navigation"
import { ImportWalletInput } from "./Components/ImportWalletInput"
import { useNavigation } from "@react-navigation/native"
import {
    selectAreDevFeaturesEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectHasOnboarded } from "~Storage/Redux/Selectors"
import { setMnemonic, setPrivateKey } from "~Storage/Redux/Actions"
import HapticsService from "~Services/HapticsService"
import { AnalyticsEvent } from "~Constants"
import { IMPORT_TYPE } from "~Model"
import { UnlockKeystoreBottomSheet } from "./Components/UnlockKeystoreBottomSheet"

const DEMO_MNEMONIC =
    "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

export const ImportLocalWallet = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const theme = useTheme()
    const track = useAnalyticTracking()

    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const areDevFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const [textValue, setTextValue] = useState<string>("")
    const [isError, setIsError] = useState<string>("")

    const { checkCanImportDevice } = useDeviceUtils()

    const {
        ref: unlockKeystoreBottomSheetRef,
        onOpen: openUnlockKeystoreBottomSheet,
        onClose: closeUnlockKeystoreBottomSheet,
    } = useBottomSheetModal()

    const importType = useMemo(
        () => CryptoUtils.determineKeyImportType(textValue),
        [textValue],
    )

    const completeImport = useCallback(() => {
        HapticsService.triggerImpact({ level: "Medium" })
        if (userHasOnboarded) {
            nav.navigate(Routes.WALLET_SUCCESS)
        } else {
            nav.navigate(Routes.APP_SECURITY)
        }
    }, [nav, userHasOnboarded])

    const importMnemonic = useCallback(
        (_mnemonic: string) => {
            try {
                const mnemonic = CryptoUtils.mnemonicStringToArray(_mnemonic)
                checkCanImportDevice(mnemonic)
                dispatch(setMnemonic(mnemonic))
                track(AnalyticsEvent.IMPORT_MNEMONIC_SUBMITTED)
                completeImport()
            } catch (err) {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_INCORRECT_MNEMONIC())
                track(AnalyticsEvent.IMPORT_MNEMONIC_FAILED)
            }
        },
        [checkCanImportDevice, dispatch, track, completeImport, LL],
    )

    const importPrivateKey = useCallback(
        (_privKey: string) => {
            try {
                checkCanImportDevice(undefined, _privKey)
                dispatch(setPrivateKey(_privKey))
                track(AnalyticsEvent.IMPORT_PRIVATE_KEY_SUBMITTED)
                completeImport()
            } catch (err) {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_INCORRECT_PRIVATE_KEY())
                track(AnalyticsEvent.IMPORT_PRIVATE_KEY_FAILED)
            }
        },
        [checkCanImportDevice, dispatch, track, completeImport, LL],
    )

    const onUnlockKeyStoreFile = useCallback(
        async (pwd: string) => {
            try {
                const privateKey = await CryptoUtils.decryptKeystoreFile(
                    textValue,
                    pwd,
                )
                checkCanImportDevice(undefined, privateKey)
                dispatch(setPrivateKey(privateKey))
                track(AnalyticsEvent.IMPORT_KEYSTORE_FILE_SUBMITTED)
                completeImport()
            } catch (err) {
                error("Error unlocking keystore file", err)
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_INCORRECT_PASSWORD())
                track(AnalyticsEvent.IMPORT_KEYSTORE_FILE_FAILED)
            }
        },
        [textValue, checkCanImportDevice, dispatch, track, completeImport, LL],
    )

    const onVerify = useCallback(
        (_textValue: string, _importType: string) => {
            try {
                if (_importType === IMPORT_TYPE.UNKNOWN)
                    throw new Error("Unknown import type")

                if (_importType === IMPORT_TYPE.KEYSTORE_FILE) {
                    openUnlockKeystoreBottomSheet()
                    return
                }

                if (_importType === IMPORT_TYPE.MNEMONIC)
                    importMnemonic(_textValue)
                else if (_importType === IMPORT_TYPE.PRIVATE_KEY)
                    importPrivateKey(_textValue)
            } catch (err) {
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_INCORRECT_IMPORT_DATA())
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

    const handleVerify = useCallback(
        () => onVerify(textValue, importType),
        [textValue, onVerify, importType],
    )

    const disabledAction = useCallback(
        () => setIsError(LL.ERROR_INCORRECT_IMPORT_DATA()),
        [LL],
    )

    return (
        <DismissKeyboardView>
            <Layout
                body={
                    <BaseView justifyContent="space-between">
                        <BaseView>
                            <BaseView flexDirection="row" w={100}>
                                <BaseText typographyFont="title">
                                    {LL.TITLE_WALLET_IMPORT_LOCAL()}
                                </BaseText>
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

                            <ImportWalletInput
                                value={textValue}
                                onChangeText={onChangeText}
                                isError={!!isError}
                            />

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
                }
                footer={
                    <BaseView w={100}>
                        <BaseButton
                            action={handleVerify}
                            w={100}
                            title={LL.BTN_IMPORT_WALLET_VERIFY()}
                            disabled={importType === IMPORT_TYPE.UNKNOWN}
                            disabledAction={disabledAction}
                            disabledActionHaptics="Heavy"
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
