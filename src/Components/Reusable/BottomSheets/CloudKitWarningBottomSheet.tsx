import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Keyboard, StyleSheet, TextInput } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { Layout } from "../Layout"
import { COLORS } from "~Constants"
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator"
import { Easing, useSharedValue, withTiming } from "react-native-reanimated"
import { useI18nContext } from "~i18n"

type Props = {
    onHandleBackupToCloudKit: (password: string) => void
    openLocation: "Backup_Screen" | "Import_Screen"
}

export const CloudKitWarningBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
    ({ onHandleBackupToCloudKit, openLocation }, ref) => {
        const { LL } = useI18nContext()
        // const [secureText1, setsecureText1] = useState(true)
        // const [secureText2, setsecureText2] = useState(true)
        const [password1, setPassword1] = useState("")
        const [password2, setPassword2] = useState("")
        const [passwordMisMatch, setPasswordMisMatch] = useState(false)
        const [passwordNotStrong, setPasswordNotStrong] = useState(false)
        const [isChecking, setIsChecking] = useState(false)

        const inputRef = useRef<TextInput>(null)

        const { styles } = useThemedStyles(baseStyles)
        const strength = useSharedValue(0)

        // reset PasswordMisMatch and PasswordNotStrong when user starts typing again
        useEffect(() => {
            if (!password1 && !password2 && isChecking) {
                setPasswordMisMatch(false)
                setPasswordNotStrong(false)
                setIsChecking(false)
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
                    strength.value = 0
                }
            },
            [strength],
        )

        const checkPasswordValidity = useCallback(() => {
            setPasswordMisMatch(false)
            setPasswordNotStrong(false)
            setIsChecking(true)
            if (openLocation === "Backup_Screen") {
                if (password1 === password2 && strength.value >= 4) {
                    onHandleBackupToCloudKit(password1)
                } else {
                    if (password1 !== password2) setPasswordMisMatch(true)
                    if (strength.value < 4) setPasswordNotStrong(true)
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
            <BaseBottomSheet snapPoints={["92%"]} ref={ref} enableDismissOnClose onChange={handleOnDismissBottomSheet}>
                <Layout
                    noBackButton
                    noMargin
                    noStaticBottomPadding
                    hasSafeArea={false}
                    fixedBody={
                        <BaseView flex={1}>
                            <BaseView flexDirection="row" w={100}>
                                <BaseView justifyContent="center" alignItems="center" mr={12}>
                                    <BaseView
                                        justifyContent="center"
                                        bg={COLORS.PASTEL_ORANGE}
                                        style={styles.warningIcon}>
                                        <BaseIcon my={8} size={22} name="alert-outline" color={COLORS.MEDIUM_ORANGE} />
                                    </BaseView>
                                </BaseView>

                                <BaseText typographyFont="subTitleBold">{LL.BD_CLOUD_BACKUP_PASSWORD()}</BaseText>
                            </BaseView>

                            <BaseSpacer height={24} />
                            <BaseText>
                                {openLocation === "Backup_Screen"
                                    ? LL.BD_CLOUD_PASSWORD_CREATION_MESSAGE()
                                    : LL.BD_CLOUD_INSERT_PASSWORD()}
                            </BaseText>
                            <BaseSpacer height={24} />

                            <BaseTextInput
                                placeholder={
                                    openLocation === "Backup_Screen"
                                        ? LL.BTN_CHOOSE_PASSWORD()
                                        : LL.BTN_ENTER_PASSWORD()
                                }
                                secureTextEntry
                                // rightIcon={secureText1 ? "eye-off" : "eye"}
                                // onIconPress={() => setsecureText1(prev => !prev)}
                                value={password1}
                                autoFocus
                                setValue={(s: string) =>
                                    openLocation === "Backup_Screen" ? handlePasswordChange(s) : setPassword1(s)
                                }
                                textContentType="newPassword"
                                passwordRules="required: digit; minlength: 6; required: special; required: lower;"
                                // onSubmitEditing={() => inputRef?.current?.focus()}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss()
                                    onHandleBackupToCloudKit(password1)
                                }}
                            />

                            {openLocation === "Backup_Screen" && <PasswordStrengthIndicator strength={strength} />}

                            {openLocation === "Backup_Screen" && (
                                <>
                                    <BaseSpacer height={24} />
                                    <TextInput
                                        placeholder={LL.BTN_CONFIRN_PASSWORD()}
                                        // secureTextEntry={secureText2}
                                        // rightIcon={secureText2 ? "eye-off" : "eye"}
                                        // onIconPress={() => setsecureText2(prev => !prev)}
                                        value={password2}
                                        onChangeText={setPassword2}
                                        ref={inputRef}
                                    />

                                    <BaseView justifyContent="flex-start" alignItems="flex-start" my={8}>
                                        {passwordMisMatch && (
                                            <BaseText color={COLORS.DARK_RED} mt={4}>
                                                {LL.BD_PASSWORDS_DO_NOT_MATCH()}
                                            </BaseText>
                                        )}

                                        {passwordNotStrong && (
                                            <BaseText color={COLORS.DARK_RED} mt={4}>
                                                {LL.BD_PASSWORD_NOT_STRONG()}
                                            </BaseText>
                                        )}
                                    </BaseView>
                                </>
                            )}
                        </BaseView>
                    }
                    footer={
                        <>
                            <BaseButton title={LL.COMMON_PROCEED()} action={checkPasswordValidity} />
                            <BaseSpacer height={24} />
                        </>
                    }
                />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        warningIcon: {
            width: 44,
            height: 44,
            borderRadius: 12,
        },
    })
