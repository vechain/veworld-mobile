import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Keyboard, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseBottomSheetTextInput, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator"
import { Easing, useSharedValue, withTiming } from "react-native-reanimated"
import { useI18nContext } from "~i18n"
import { TextInput } from "react-native-gesture-handler"
import { AlertInlineTransparent, CheckBoxWithText } from "~Components"
import { FeatherKeySVG } from "~Assets"
import { PlatformUtils } from "~Utils"

type Props = {
    onHandleBackupToCloudKit: (password: string) => void
    openLocation: "Backup_Screen" | "Import_Screen"
    isLoading?: boolean
}

export const CloudKitWarningBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
    ({ onHandleBackupToCloudKit, openLocation, isLoading }, ref) => {
        const { LL } = useI18nContext()
        const [secureText1, setsecureText1] = useState(true)
        const [secureText2, setsecureText2] = useState(true)
        const [password1, setPassword1] = useState("")
        const [password2, setPassword2] = useState("")
        const [passwordMisMatch, setPasswordMisMatch] = useState(false)
        const [passwordNotStrong, setPasswordNotStrong] = useState(false)
        const [isChecking, setIsChecking] = useState(false)
        const [isChecked, setIsChecked] = useState(false)
        const [showStrengthIndicator, setShowStrengthIndicator] = useState(true)

        const inputRef = useRef<TextInput>(null)
        const { styles, theme } = useThemedStyles(baseStyles)
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
            if (_password.match(/[a-zA-Z]/)) _strength += 1
            // Check for at least one number
            if (_password.match(/[0-9]/)) _strength += 1
            // Check for at least one special character
            if (_password.match(/[^a-zA-Z0-9]/)) _strength += 1

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
                        <FeatherKeySVG size={64} color={theme.colors.text} />
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
                        secureTextEntry={secureText1}
                        isError={passwordMisMatch || passwordNotStrong}
                        isPasswordInput
                        rightIcon={secureText1 ? "eye-off-outline" : "eye-outline"}
                        onIconPress={() => setsecureText1(prev => !prev)}
                        value={password1}
                        autoFocus
                        setValue={(s: string) =>
                            openLocation === "Backup_Screen" ? handlePasswordChange(s) : setPassword1(s)
                        }
                        onSubmitEditing={() => inputRef?.current?.focus()}
                        returnKeyType={openLocation === "Backup_Screen" ? "next" : "done"}
                    />
                    <BaseSpacer height={2} />
                    <BaseView style={styles.passwordInfo}>
                        {openLocation === "Backup_Screen" && showStrengthIndicator && (
                            <PasswordStrengthIndicator strength={strength} showComputedStrength={false} />
                        )}

                        {passwordMisMatch && (
                            <>
                                <BaseSpacer height={4} />
                                <AlertInlineTransparent message={LL.BD_PASSWORDS_DO_NOT_MATCH()} status="error" />
                            </>
                        )}
                        {passwordNotStrong && (
                            <>
                                <BaseSpacer height={4} />
                                <AlertInlineTransparent message={LL.BD_PASSWORD_NOT_STRONG()} status="error" />
                            </>
                        )}
                    </BaseView>

                    {openLocation === "Backup_Screen" && (
                        <BaseBottomSheetTextInput
                            placeholder={LL.BTN_CONFIRN_PASSWORD()}
                            secureTextEntry={secureText2}
                            isPasswordInput
                            rightIcon={secureText2 ? "eye-off-outline" : "eye-outline"}
                            onIconPress={() => setsecureText2(prev => !prev)}
                            value={password2}
                            onChangeText={setPassword2}
                            ref={inputRef}
                            onSubmitEditing={() => Keyboard.dismiss()}
                            returnKeyType="done"
                        />
                    )}
                    <BaseSpacer height={16} />
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

const baseStyles = (theme: ColorThemeType) =>
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
        passwordInfo: {
            marginTop: 0,
            paddingTop: 0,
            height: 52,
        },
    })
