import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { getTimeZone } from "react-native-localize"
import { Easing, useSharedValue, withTiming } from "react-native-reanimated"
import { FeatherKeySVG } from "~Assets"
import {
    AlertInline,
    BackupSuccessfulBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    CheckBoxWithText,
    Layout,
    PasswordStrengthIndicator,
    showErrorToast,
} from "~Components"
import { COLORS, ColorThemeType, DerivationPath, typography } from "~Constants"
import { useBottomSheetModal, useCloudBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { selectIsAppLoading, setDeviceIsBackup, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { AddressUtils, CryptoUtils, DateUtils, HexUtils, PasswordUtils, PlatformUtils } from "~Utils"

const { defaults: defaultTypography } = typography

export const ChooseMnemonicBackupPassword = () => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL, locale } = useI18nContext()
    const navigation = useNavigation()
    const dispatch = useAppDispatch()

    const isAppLoading = useAppSelector(selectIsAppLoading)

    const route = useRoute<RouteProp<RootStackParamListSettings, Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD>>()
    const { mnemonicArray, device } = route.params

    const inputRef = useRef<TextInput>(null)

    const [secureText1, setSecureText1] = useState(true)
    const [secureText2, setSecureText2] = useState(true)
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const [passwordMisMatch, setPasswordMisMatch] = useState(false)
    const [passwordNotStrong, setPasswordNotStrong] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [showStrengthIndicator, setShowStrengthIndicator] = useState(true)

    const strength = useSharedValue(0)

    const { ref: successRef, onOpen: onOpenSuccess } = useBottomSheetModal()
    const { saveWalletToCloud } = useCloudBackup()

    const backupWalletToCloud = useCallback(
        async (password: string) => {
            dispatch(setIsAppLoading(true))
            try {
                if (!device?.xPub) {
                    showErrorToast({
                        text1: LL.CLOUDKIT_ERROR_GENERIC(),
                    })
                    return
                }

                const firstAccountAddress = AddressUtils.getAddressFromXPub(device.xPub, 0)
                const salt = HexUtils.generateRandom(256)
                const iv = PasswordUtils.getRandomIV(16)
                const mnemonic = await CryptoUtils.encrypt(mnemonicArray, password, salt, iv)
                const isOperationSuccessfull = await saveWalletToCloud({
                    mnemonic,
                    _rootAddress: device?.rootAddress,
                    deviceType: device?.type,
                    firstAccountAddress,
                    salt,
                    iv,
                    derivationPath: device?.derivationPath ?? DerivationPath.VET,
                })

                if (isOperationSuccessfull) {
                    const formattedDate = DateUtils.formatDateTime(
                        Date.now(),
                        locale,
                        getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
                    )
                    dispatch(
                        setDeviceIsBackup({
                            rootAddress: device.rootAddress,
                            isBackup: true,
                            date: formattedDate,
                        }),
                    )

                    onOpenSuccess()
                } else {
                    showErrorToast({
                        text1: PlatformUtils.isIOS() ? LL.CLOUDKIT_ERROR_GENERIC() : LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                    })
                }
            } catch (error) {
                showErrorToast({
                    text1: PlatformUtils.isIOS() ? LL.CLOUDKIT_ERROR_GENERIC() : LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                })
            } finally {
                dispatch(setIsAppLoading(false))
            }
        },
        [
            dispatch,
            device.xPub,
            device.rootAddress,
            device?.type,
            device?.derivationPath,
            mnemonicArray,
            saveWalletToCloud,
            LL,
            locale,
            onOpenSuccess,
        ],
    )

    const calculateStrength = useCallback((_password: string) => {
        if (!_password) return 0
        let _strength = 0
        // Check for length of at least 6 characters
        if (_password.length >= 6) _strength += 1
        // Check for at least one letter (either lowercase or uppercase)
        if (_password.match(/[a-zA-Z]/)) _strength += 1
        // Check for at least one number
        if (_password.match(/[0-9]/)) _strength += 1
        // Check for at least one special character
        if (_password.match(/[^a-zA-Z0-9]/)) _strength += 1

        return _strength
    }, [])

    const handlePasswordChange = (text: string) => {
        setPassword1(text)
        const newStrength = calculateStrength(text)
        strength.value = withTiming(newStrength, {
            duration: 500,
            easing: Easing.out(Easing.exp),
        })
    }

    const checkPasswordValidity = useCallback(async () => {
        setPasswordMisMatch(false)
        setPasswordNotStrong(false)
        setIsChecking(true)

        if (password1 === password2 && strength.value >= 4) {
            setShowStrengthIndicator(true)
            backupWalletToCloud(password1)
        } else {
            if (password1 !== password2) setPasswordMisMatch(true)
            if (strength.value < 4) {
                setPasswordNotStrong(true)
                setShowStrengthIndicator(false)
            }
        }
    }, [backupWalletToCloud, password1, password2, strength.value])

    useEffect(() => {
        if (!password1 && !password2 && isChecking) {
            setPasswordMisMatch(false)
            setPasswordNotStrong(false)
            setIsChecking(false)
            setShowStrengthIndicator(true)
            strength.value = 0
        }
    }, [password1, password2, isChecking, strength])

    const onSuccessModalClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    return (
        <Layout
            body={
                <BaseView>
                    <BaseView justifyContent="center" alignItems="center" style={styles.keyIcon}>
                        <FeatherKeySVG width={64} height={64} stroke={theme.colors.text} />
                        <BaseSpacer height={20} />
                        <BaseView justifyContent="center" alignItems="center">
                            <BaseText align="center" typographyFont="subSubTitleMedium">
                                {LL.BTN_SECURITY_CREATE_PASSWORD_BACKUP()}
                            </BaseText>
                            <BaseSpacer height={8} />
                            <BaseText align="center" typographyFont="body">
                                {LL.BD_CLOUD_PASSWORD_CREATION_MESSAGE()}
                            </BaseText>
                            <BaseSpacer height={8} />
                            <BaseText align="center" typographyFont="bodyBold">
                                {LL.BD_CLOUD_PASSWORD_RECOVER_MESSAGE()}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={32} />

                    <BaseTextInput
                        placeholder={LL.BTN_WRITE_RECOVERY_PASSWORD()}
                        placeholderTextColor={theme.colors.passwordPlaceholder}
                        secureTextEntry={secureText1}
                        containerStyle={styles.containerPassword}
                        inputContainerStyle={styles.inputPassword}
                        style={styles.inputPassword}
                        rightIcon={
                            <BaseIcon
                                haptics="Light"
                                action={() => setSecureText1(prev => !prev)}
                                name={secureText1 ? "eye-off-outline" : "eye-outline"}
                                size={16}
                                color={COLORS.GREY_500}
                                style={styles.toggleIcon}
                            />
                        }
                        value={password1}
                        autoFocus
                        setValue={handlePasswordChange}
                        onSubmitEditing={() => inputRef?.current?.focus()}
                        returnKeyType={"next"}
                    />
                    <BaseSpacer height={4} />
                    {showStrengthIndicator && (
                        <PasswordStrengthIndicator strength={strength} showComputedStrength={false} noMargin={true} />
                    )}

                    {passwordNotStrong && <AlertInline message={LL.BD_PASSWORD_NOT_STRONG()} status="error" />}
                    <BaseSpacer height={24} />
                    <BaseView>
                        <BaseTextInput
                            placeholder={LL.BTN_REPEAT_PASSWORD()}
                            placeholderTextColor={theme.colors.passwordPlaceholder}
                            secureTextEntry={secureText2}
                            containerStyle={styles.containerPassword}
                            inputContainerStyle={styles.inputPassword}
                            style={styles.inputPassword}
                            rightIcon={
                                <BaseIcon
                                    haptics="Light"
                                    action={() => setSecureText2(prev => !prev)}
                                    name={secureText2 ? "eye-off-outline" : "eye-outline"}
                                    size={16}
                                    color={COLORS.GREY_500}
                                    style={styles.toggleIcon}
                                />
                            }
                            value={password2}
                            onChangeText={setPassword2}
                            ref={inputRef}
                            onSubmitEditing={Keyboard.dismiss}
                            returnKeyType="done"
                        />
                        <BaseSpacer height={4} />
                        {passwordMisMatch && <AlertInline message={LL.BD_PASSWORDS_DO_NOT_MATCH()} status="error" />}
                        <BaseSpacer height={14} />
                    </BaseView>
                    <CheckBoxWithText
                        isChecked={isChecked}
                        text={LL.BD_CLOUD_PASSWORD_WARNING_CHECKBOX()}
                        checkAction={setIsChecked}
                        fontColor={theme.colors.text}
                    />
                    <BaseSpacer height={12} />
                    <BaseButton
                        typographyFont="bodyMedium"
                        w={100}
                        disabled={!isChecked || isAppLoading}
                        haptics="Light"
                        title={PlatformUtils.isIOS() ? LL.BTN_BACKUP_TO_ICLOUD() : LL.BTN_BACKUP_TO_DRIVE()}
                        action={checkPasswordValidity}
                    />
                    <BaseSpacer height={16} />
                    <BackupSuccessfulBottomSheet ref={successRef} onConfirm={onSuccessModalClose} />
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
