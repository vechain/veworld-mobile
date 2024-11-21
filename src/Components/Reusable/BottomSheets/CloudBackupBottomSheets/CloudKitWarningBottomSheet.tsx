import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Keyboard, StyleSheet } from "react-native"
import {
    BaseBottomSheet,
    BaseBottomSheetTextInput,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType, typography } from "~Constants"
import { Easing, useSharedValue, withTiming } from "react-native-reanimated"
import { useI18nContext } from "~i18n"
import { TextInput } from "react-native-gesture-handler"
import { AlertInline, CheckBoxWithText, PasswordStrengthIndicator } from "~Components"
import { FeatherKeySVG } from "~Assets"
import { PlatformUtils } from "~Utils"

const { defaults: defaultTypography } = typography

type Props = {
    onHandleBackupToCloudKit: (password: string) => void
    openLocation: "Backup_Screen" | "Import_Screen"
    isLoading?: boolean
}

export const CloudKitWarningBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
    ({ onHandleBackupToCloudKit, openLocation, isLoading }, ref) => {
        const { LL } = useI18nContext()
        const [secureText1, setSecureText1] = useState(true)
        const [secureText2, setSecureText2] = useState(true)
        const [password1, setPassword1] = useState("")
        const [password2, setPassword2] = useState("")
        const [passwordMisMatch, setPasswordMisMatch] = useState(false)
        const [passwordNotStrong, setPasswordNotStrong] = useState(false)
        const [isChecking, setIsChecking] = useState(false)
        const [isChecked, setIsChecked] = useState(false)
        const [showStrengthIndicator, setShowStrengthIndicator] = useState(true)

        const inputRef = useRef<TextInput>(null)
        const { styles, theme } = useThemedStyles(baseStyles(passwordMisMatch || passwordNotStrong))
        const strength = useSharedValue(0)

        // reset PasswordMisMatch and PasswordNotStrong when user starts typing again
        useEffect(() => {
            if (!password1 && !password2 && isChecking) {
                setPasswordMisMatch(false)
                setPasswordNotStrong(false)
                setIsChecking(false)
                setShowStrengthIndicator(true)
                strength.value = 0
            }
        }, [password1, password2, isChecking, strength])

        const handleOnDismissBottomSheet = useCallback(
            (index: number) => {
                if (index === -1) {
                    setPassword1("")
                    setPassword2("")
                    setPasswordMisMatch(false)
                    setPasswordNotStrong(false)
                    setIsChecking(false)
                    setShowStrengthIndicator(true)
                    strength.value = 0
                }
            },
            [strength],
        )

        const checkPasswordValidity = useCallback(async () => {
            setPasswordMisMatch(false)
            setPasswordNotStrong(false)
            setIsChecking(true)

            if (openLocation === "Backup_Screen") {
                if (password1 === password2 && strength.value >= 4) {
                    setShowStrengthIndicator(true)
                    onHandleBackupToCloudKit(password1)
                } else {
                    if (password1 !== password2) setPasswordMisMatch(true)
                    if (strength.value < 4) setPasswordNotStrong(true)
                    setShowStrengthIndicator(false)
                }
            }

            if (openLocation === "Import_Screen") {
                onHandleBackupToCloudKit(password1)
            }
        }, [onHandleBackupToCloudKit, openLocation, password1, password2, strength.value])

        const calculateStrength = useCallback((_password: string) => {
            if (!_password) return 0
            let _strength = 0
            // Check for length of at least 6 characters
            if (_password.length >= 6) _strength += 1
            // Check for at least one letter (either lowercase or uppercase)
            if (RegExp(/[a-zA-Z]/).exec(_password)) _strength += 1
            // Check for at least one number
            if (RegExp(/\d/).exec(_password)) _strength += 1
            // Check for at least one special character
            if (RegExp(/\W/).exec(_password)) _strength += 1

            return _strength
        }, [])

        const handlePasswordChange = useCallback(
            (text: string) => {
                setPassword1(text)

                strength.value = withTiming(calculateStrength(text), {
                    duration: 500,
                    easing: Easing.out(Easing.exp),
                })
            },
            [calculateStrength, strength],
        )

        return (
            <BaseBottomSheet
                ref={ref}
                enableDismissOnClose
                dynamicHeight
                onChange={handleOnDismissBottomSheet}
                backgroundStyle={styles.passwordSheet}
                contentStyle={styles.contentContainer}
                bottomSafeArea={true}
                blurBackdrop={true}>
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

                    <BaseBottomSheetTextInput
                        placeholder={
                            openLocation === "Backup_Screen"
                                ? LL.BTN_WRITE_RECOVERY_PASSWORD()
                                : LL.BTN_ENTER_PASSWORD()
                        }
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
                        setValue={(s: string) =>
                            openLocation === "Backup_Screen" ? handlePasswordChange(s) : setPassword1(s)
                        }
                        onSubmitEditing={() => inputRef?.current?.focus()}
                        returnKeyType={openLocation === "Backup_Screen" ? "next" : "done"}
                    />
                    <BaseSpacer height={4} />
                    {openLocation === "Backup_Screen" && showStrengthIndicator && (
                        <PasswordStrengthIndicator strength={strength} showComputedStrength={false} noMargin={true} />
                    )}

                    {passwordNotStrong && <AlertInline message={LL.BD_PASSWORD_NOT_STRONG()} status="error" />}
                    <BaseSpacer height={24} />
                    <BaseView>
                        {openLocation === "Backup_Screen" && (
                            <BaseBottomSheetTextInput
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
                                onSubmitEditing={() => Keyboard.dismiss()}
                                returnKeyType="done"
                            />
                        )}
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
                        disabled={!isChecked || isLoading}
                        haptics="Light"
                        title={PlatformUtils.isIOS() ? LL.BTN_BACKUP_TO_ICLOUD() : LL.BTN_BACKUP_TO_DRIVE()}
                        action={checkPasswordValidity}
                    />
                    <BaseSpacer height={16} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (isError: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        keyIcon: {
            color: theme.colors.text,
        },
        contentContainer: {
            paddingTop: 16,
        },
        passwordSheet: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        containerPassword: {
            flexDirection: "row",
            alignItems: "center",
            borderColor: isError ? COLORS.RED_500 : COLORS.GREY_200,
            borderWidth: isError ? 2 : 1,
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
