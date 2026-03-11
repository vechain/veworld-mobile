import { useNavigation } from "@react-navigation/native"
import * as Clipboard from "expo-clipboard"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated"
import {
    AlertInline,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    CreatePasswordModal,
    DismissKeyboardView,
    InfoBottomSheet,
    Layout,
    RequireUserPassword,
} from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { AnalyticsEvent, COLORS, ColorThemeType, DerivationPath } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useCheckIdentity, useDeviceUtils, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_CREATION_ERRORS as ERRORS, IMPORT_TYPE } from "~Model"
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import HapticsService from "~Services/HapticsService"
import { selectDerivedPath, selectHasOnboarded, setDerivedPath, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { CryptoUtils, PlatformUtils } from "~Utils"
import { ImportWalletInput } from "./Components/ImportWalletInput"
import { UnlockKeystoreBottomSheet } from "./Components/UnlockKeystoreBottomSheet"

enum ButtonType {
    local,
    icloud,
    googleDrive,
    unknown,
}

export const ImportLocalWallet = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const {
        onCreateWallet,
        importOnboardedWallet,
        isOpen,
        isError: isCreateError,
        onSuccess,
        onClose: onCloseCreateFlow,
    } = useHandleWalletCreation()

    const currentDerivedPath = useAppSelector(selectDerivedPath)
    const [derivationPath, setDerivationPath] = useState<DerivationPath>(currentDerivedPath ?? DerivationPath.VET)
    const [textValue, setTextValue] = useState<string>("")
    const [isError, setIsError] = useState<string>("")

    const { checkCanImportDevice } = useDeviceUtils()

    const computeButtonType = useMemo(() => {
        if (textValue.length || PlatformUtils.isAndroid()) {
            return ButtonType.local
        }

        return ButtonType.unknown
    }, [textValue.length])

    const {
        ref: unlockKeystoreBottomSheetRef,
        onOpen: openUnlockKeystoreBottomSheet,
        onClose: closeUnlockKeystoreBottomSheet,
    } = useBottomSheetModal()

    const { ref: infoBottomSheetRef, onOpen: onOpenInfoBottomSheet } = useBottomSheetModal()

    const mnemonicCache = useRef<string[]>([])
    const privateKeyCache = useRef<string>("")

    const importType = useMemo(() => CryptoUtils.determineKeyImportType(textValue), [textValue])

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
                derivationPath: derivationPath,
                importType,
            })
            nav.goBack()
        },
        allowAutoPassword: false,
    })

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
                checkCanImportDevice(derivationPath, mnemonic)
                mnemonicCache.current = mnemonic
                track(AnalyticsEvent.IMPORT_MNEMONIC_SUBMITTED)
                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateWallet({
                        importMnemonic: mnemonic,
                        derivationPath: derivationPath,
                        importType: IMPORT_TYPE.MNEMONIC,
                    })
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
            derivationPath,
            processErrorMessage,
        ],
    )

    const importPrivateKey = useCallback(
        (_privKey: string) => {
            try {
                checkCanImportDevice(derivationPath, undefined, _privKey)
                privateKeyCache.current = _privKey
                track(AnalyticsEvent.IMPORT_PRIVATE_KEY_SUBMITTED)
                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateWallet({
                        privateKey: _privKey,
                        derivationPath: derivationPath,
                        importType: IMPORT_TYPE.PRIVATE_KEY,
                    })
                }
            } catch (err) {
                processErrorMessage(err)
                track(AnalyticsEvent.IMPORT_PRIVATE_KEY_FAILED)
            }
        },
        [
            checkCanImportDevice,
            derivationPath,
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
                checkCanImportDevice(derivationPath, undefined, privateKey)
                privateKeyCache.current = privateKey
                track(AnalyticsEvent.IMPORT_KEYSTORE_FILE_SUBMITTED)
                if (userHasOnboarded) {
                    checkIdentityBeforeOpening_1()
                } else {
                    onCreateWallet({
                        privateKey,
                        derivationPath: derivationPath,
                        importType: IMPORT_TYPE.KEYSTORE_FILE,
                    })
                }
            } catch (err) {
                processErrorMessage(err)
                track(AnalyticsEvent.IMPORT_KEYSTORE_FILE_FAILED)
            }
        },
        [
            textValue,
            checkCanImportDevice,
            derivationPath,
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

    const handleSelectDerivationPath = useCallback(
        (path: DerivationPath) => {
            setDerivationPath(path)
            track(AnalyticsEvent.WALLET_ADD_DERIVATION_PATH_TYPE, { path })
            dispatch(setDerivedPath(path))
        },
        [track, dispatch],
    )

    const handleVerify = useCallback(() => onVerify(textValue, importType), [onVerify, textValue, importType])
    const disabledAction = useCallback(() => setIsError(LL.ERROR_INVALID_IMPORT_DATA()), [LL])

    const footerButtonDisabled = useMemo(() => {
        return computeButtonType === ButtonType.unknown || (!textValue.length && computeButtonType === ButtonType.local)
    }, [computeButtonType, textValue.length])

    return (
        <DismissKeyboardView>
            <Layout
                title={LL.SB_TITLE_IMPORT_WITH_KEYS()}
                headerRightElement={
                    <BaseIcon
                        name="icon-info"
                        size={20}
                        color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                        action={onOpenInfoBottomSheet}
                    />
                }
                body={
                    <>
                        <Animated.View layout={LinearTransition} style={styles.contentContainer}>
                            <BaseView>
                                <BaseView alignItems="center" justifyContent="center">
                                    <BaseIcon
                                        name="icon-file-spreadsheet"
                                        size={48}
                                        color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE}
                                    />
                                </BaseView>
                                <BaseSpacer height={16} />
                                <BaseText
                                    typographyFont="bodyMedium"
                                    my={10}
                                    align="center"
                                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                                    {LL.WALLET_IMPORT_LOCAL_DESCRIPTION()}
                                </BaseText>

                                <BaseSpacer height={24} />

                                {Boolean(textValue.length) && (
                                    <Animated.View layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                                        <BaseView flex={1}>
                                            <BaseText
                                                align="left"
                                                typographyFont="captionMedium"
                                                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                                                {"Derivation Path"}
                                            </BaseText>
                                        </BaseView>
                                        <BaseSpacer height={8} />
                                        <BaseTabs
                                            keys={[DerivationPath.VET, DerivationPath.ETH]}
                                            labels={["VeChain", "Ethereum"]}
                                            selectedKey={derivationPath}
                                            setSelectedKey={handleSelectDerivationPath}
                                        />
                                        <BaseSpacer height={12} />
                                    </Animated.View>
                                )}

                                <Animated.View layout={LinearTransition}>
                                    <ImportWalletInput
                                        value={textValue}
                                        onChangeText={onChangeText}
                                        isError={!!isError}
                                    />

                                    <BaseSpacer height={12} />
                                    <BaseView style={styles.copyPasteButtonContainer}>
                                        <BaseView flex={1}>
                                            {!!isError && (
                                                <AlertInline
                                                    testID={"IMPORT_LOCAL_WALLET_ERROR"}
                                                    message={isError}
                                                    status="error"
                                                />
                                            )}
                                        </BaseView>
                                        <BaseButton
                                            testID={
                                                textValue.length
                                                    ? "IMPORT_LOCAL_WALLET_CLEAR_BUTTON"
                                                    : "IMPORT_LOCAL_WALLET_PASTE_BUTTON"
                                            }
                                            rightIcon={
                                                <BaseIcon
                                                    name={textValue.length ? "icon-circle-x" : "icon-paste"}
                                                    size={16}
                                                    color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}
                                                />
                                            }
                                            title={
                                                textValue.length
                                                    ? LL.SEND_RECEIVER_ADDRESS_INPUT_CLEAR()
                                                    : LL.SEND_RECEIVER_ADDRESS_INPUT_PASTE()
                                            }
                                            textColor={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}
                                            typographyFont="captionSemiBold"
                                            style={styles.copyPasteButton}
                                            action={textValue.length ? onClearSeed : onPasteFromClipboard}
                                        />
                                    </BaseView>
                                </Animated.View>

                                <UnlockKeystoreBottomSheet
                                    ref={unlockKeystoreBottomSheetRef}
                                    onHide={closeUnlockKeystoreBottomSheet}
                                    onUnlock={onUnlockKeyStoreFile}
                                />
                            </BaseView>
                        </Animated.View>

                        <CreatePasswordModal
                            isOpen={isOpen}
                            onClose={onCloseCreateFlow}
                            onSuccess={pin =>
                                onSuccess({
                                    pin,
                                    mnemonic: mnemonicCache.current,
                                    privateKey: privateKeyCache.current,
                                    derivationPath: derivationPath,
                                    importType,
                                })
                            }
                        />

                        <InfoBottomSheet
                            bsRef={infoBottomSheetRef}
                            title={LL.BS_INFO_IMPORTING_WITH_KEYS_TITLE()}
                            description={LL.BS_INFO_IMPORTING_WITH_KEYS_DESCRIPTION()}
                        />
                    </>
                }
                footer={
                    <BaseView w={100}>
                        {!!isCreateError && (
                            <AlertInline
                                testID="IMPORT_LOCAL_WALLET_CREATE_ERROR"
                                message={LL.ERROR_GENERIC_WITH_RETRY_SUBTITLE()}
                                status="error"
                                justifyContent="center"
                                textAlign="center"
                                style={styles.alertContainer}
                            />
                        )}

                        <BaseButton
                            testID={"IMPORT_LOCAL_WALLET_IMPORT_BUTTON"}
                            action={handleVerify}
                            style={styles.button}
                            title={isCreateError ? LL.BTN_TRY_AGAIN() : LL.BTN_IMPORT()}
                            disabled={footerButtonDisabled}
                            disabledAction={disabledAction}
                            disabledActionHaptics="Heavy"
                            haptics="Light"
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        icon: { marginHorizontal: 20 },
        ickoudIcon: { marginLeft: -12, marginRight: 12 },
        button: { justifyContent: "center", height: 48 },
        copyPasteButtonContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        copyPasteButton: {
            gap: 12,
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.WHITE,
            paddingVertical: 8,
            paddingHorizontal: 12,
        },
        contentContainer: {
            flex: 1,
            justifyContent: "space-between",
            marginTop: 16,
        },
        alertContainer: {
            marginBottom: 16,
        },
    })
