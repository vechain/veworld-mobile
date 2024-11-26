import { RouteProp, StackActions, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import React, { useCallback, useRef, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { FeatherKeySVG } from "~Assets"
import {
    BackButtonHeader,
    BaseButton,
    BaseIcon,
    BaseModal,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    Layout,
    RequireUserPassword,
    showErrorToast,
} from "~Components"
import { COLORS, ColorThemeType, ERROR_EVENTS, typography } from "~Constants"
import { useCheckIdentity, useCloudBackup, useDeviceUtils, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DrivetWallet, IMPORT_TYPE } from "~Model"
import { RootStackParamListOnboarding, Routes } from "~Navigation"
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import { UserCreatePasswordScreen } from "~Screens/Flows/WalletCreation"
import { selectHasOnboarded, selectIsAppLoading, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { CryptoUtils, error, PasswordUtils, PlatformUtils } from "~Utils"

const { defaults: defaultTypography } = typography

export const ImportMnemonicBackupPasswordScreen = () => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()
    const navigation = useNavigation()
    const dispatch = useAppDispatch()

    const isAppLoading = useAppSelector(selectIsAppLoading)

    const route = useRoute<RouteProp<RootStackParamListOnboarding, Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD>>()
    const { wallet } = route.params

    const { getSalt, getIV } = useCloudBackup()
    const { checkCanImportDevice } = useDeviceUtils()

    const mnemonicCache = useRef<string[]>()

    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const [secureText, setSecureText] = useState(true)
    const [password, setPassword] = useState("")

    const {
        onCreateWallet,
        importOnboardedWallet,
        isOpen,
        isError: isCreateError,
        onSuccess,
        onClose: onCloseCreateFlow,
    } = useHandleWalletCreation()

    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: async (pin?: string) => {
                await importOnboardedWallet({
                    importMnemonic: mnemonicCache.current,
                    importType: PlatformUtils.isIOS() ? IMPORT_TYPE.ICLOUD : IMPORT_TYPE.GOOGLE_DRIVE,
                    pin,
                    derivationPath: wallet.derivationPath,
                })
                dispatch(setIsAppLoading(false))
                navigation.dispatch(StackActions.popToTop())
            },
            allowAutoPassword: false,
        })

    const importWallet = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        const { salt } = PlatformUtils.isAndroid() ? (wallet as DrivetWallet) : await getSalt(wallet.rootAddress)
        const { iv } = PlatformUtils.isAndroid() ? (wallet as DrivetWallet) : await getIV(wallet.rootAddress)

        if (!salt || !iv) {
            showErrorToast({
                text1: LL.CLOUDKIT_ERROR_GENERIC(),
            })
            dispatch(setIsAppLoading(false))
            return
        }

        let mnemonic: string[] = []

        try {
            mnemonic = await CryptoUtils.decrypt(wallet.data, password, salt, PasswordUtils.base64ToBuffer(iv))
        } catch (err) {
            showErrorToast({
                text1: LL.ERROR_DECRYPTING_WALLET(),
            })
            dispatch(setIsAppLoading(false))
            return
        }

        try {
            checkCanImportDevice(wallet.derivationPath, mnemonic)
            mnemonicCache.current = mnemonic
            if (userHasOnboarded) {
                checkIdentityBeforeOpening()
            } else {
                await onCreateWallet({
                    importMnemonic: mnemonic,
                    derivationPath: wallet.derivationPath,
                    importType: PlatformUtils.isIOS() ? IMPORT_TYPE.ICLOUD : IMPORT_TYPE.GOOGLE_DRIVE,
                })
                dispatch(setIsAppLoading(false))
            }
        } catch (_error) {
            let er = _error as Error
            error(ERROR_EVENTS.CLOUDKIT, er, er.message)
            showErrorToast({
                text1: er.message ?? LL.ERROR_CREATING_WALLET(),
            })
            dispatch(setIsAppLoading(false))
        }
    }, [
        LL,
        checkCanImportDevice,
        checkIdentityBeforeOpening,
        dispatch,
        getIV,
        getSalt,
        onCreateWallet,
        password,
        userHasOnboarded,
        wallet,
    ])

    const userPinSuccss = useCallback(
        (_password: string) => {
            dispatch(setIsAppLoading(true))
            onPasswordSuccess(_password)
        },
        [dispatch, onPasswordSuccess],
    )

    useFocusEffect(
        useCallback(() => {
            const unsub = navigation.addListener("beforeRemove", () => {
                dispatch(setIsAppLoading(false))
            })

            return () => unsub()
        }, [dispatch, navigation]),
    )

    return (
        <Layout
            body={
                <BaseView style={styles.rootContainer}>
                    <BaseView justifyContent="center" alignItems="center" style={styles.keyIcon}>
                        <FeatherKeySVG width={64} height={64} stroke={theme.colors.text} />
                        <BaseSpacer height={20} />
                        <BaseView justifyContent="center" alignItems="center">
                            <BaseText align="center" typographyFont="subSubTitleMedium">
                                {PlatformUtils.isIOS() ? LL.BD_CLOUD_BACKUP_PASSWORD() : LL.BD_DRIVE_BACKUP_PASSWORD()}
                            </BaseText>
                            <BaseSpacer height={8} />
                            <BaseText align="center" typographyFont="body">
                                {LL.BD_CLOUD_INSERT_PASSWORD()}
                            </BaseText>
                            <BaseSpacer height={8} />
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={32} />

                    <BaseTextInput
                        placeholder={LL.BTN_ENTER_PASSWORD()}
                        placeholderTextColor={theme.colors.passwordPlaceholder}
                        secureTextEntry={secureText}
                        containerStyle={styles.containerPassword}
                        inputContainerStyle={styles.inputPassword}
                        style={styles.inputPassword}
                        rightIcon={
                            <BaseIcon
                                haptics="Light"
                                action={() => setSecureText(prev => !prev)}
                                name={secureText ? "eye-off-outline" : "eye-outline"}
                                size={16}
                                color={COLORS.GREY_500}
                                style={styles.toggleIcon}
                            />
                        }
                        value={password}
                        autoFocus
                        setValue={setPassword}
                        onSubmitEditing={Keyboard.dismiss}
                        returnKeyType={"done"}
                    />
                    <BaseSpacer height={24} />
                    <BaseSpacer height={12} />
                    {!!isCreateError && (
                        <BaseText my={10} color={theme.colors.danger}>
                            {isCreateError}
                        </BaseText>
                    )}
                    <BaseButton
                        typographyFont="bodyMedium"
                        w={100}
                        disabled={isAppLoading}
                        haptics="Light"
                        title={LL.COMMON_PROCEED()}
                        action={importWallet}
                    />
                    <BaseSpacer height={16} />

                    <BaseModal isOpen={isOpen} onClose={onCloseCreateFlow}>
                        <BaseView justifyContent="flex-start">
                            <BackButtonHeader action={onCloseCreateFlow} hasBottomSpacer={false} />
                            <UserCreatePasswordScreen
                                onSuccess={pin =>
                                    onSuccess({
                                        pin,
                                        mnemonic: mnemonicCache.current,
                                        importType: PlatformUtils.isIOS()
                                            ? IMPORT_TYPE.ICLOUD
                                            : IMPORT_TYPE.GOOGLE_DRIVE,
                                        derivationPath: wallet.derivationPath,
                                    })
                                }
                            />
                        </BaseView>
                    </BaseModal>

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={userPinSuccss}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        keyIcon: {
            color: theme.colors.text,
        },
        containerPassword: {
            flexDirection: "row",
            alignItems: "center",
            borderColor: COLORS.GREY_200,
            borderWidth: 1,
            borderRadius: 8,
            paddingRight: 8,
            backgroundColor: COLORS.WHITE,
        },
        inputPassword: {
            flex: 1,
            backgroundColor: theme.colors.transparent,
            color: COLORS.GREY_600,
            borderRadius: 8,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            lineHeight: defaultTypography.subTitle.lineHeight,
        },
        toggleIcon: {
            marginRight: 4,
        },
    })
