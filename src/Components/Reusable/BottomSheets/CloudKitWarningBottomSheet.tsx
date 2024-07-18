import React, { forwardRef, useCallback, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { Layout } from "../Layout"
import { COLORS } from "~Constants"
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator"
import { Easing, useSharedValue, withTiming } from "react-native-reanimated"

type Props = {
    onHandleBackupToCloudKit: (password: string) => void
    openLocation: "Backup_Screen" | "Import_Screen"
}

export const CloudKitWarningBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
    ({ onHandleBackupToCloudKit, openLocation }, ref) => {
        const [secureText1, setsecureText1] = useState(true)
        const [secureText2, setsecureText2] = useState(true)
        const [password1, setPassword1] = useState("")
        const [password2, setPassword2] = useState("")
        const [passwordMisMatch, setPasswordMisMatch] = useState(false)
        const [passwordNotStrong, setPasswordNotStrong] = useState(false)

        const { styles } = useThemedStyles(baseStyles)

        const strength = useSharedValue(0)

        const checkPasswordValidity = useCallback(() => {
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
            <BaseBottomSheet snapPoints={["92%"]} ref={ref}>
                <Layout
                    noBackButton
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

                                <BaseText typographyFont="subTitleBold">{"iCloud Backup Password"}</BaseText>
                            </BaseView>

                            <BaseSpacer height={24} />
                            <BaseText>
                                {openLocation === "Backup_Screen"
                                    ? // eslint-disable-next-line max-len
                                      "This password will secure your secret recovery phrase in the cloud. VeWorld does NOT have access to your password. We can NOT reset it if you lose it, so keep it safe."
                                    : "Enter the password you used to back up your wallet."}
                            </BaseText>
                            <BaseSpacer height={24} />

                            <BaseTextInput
                                placeholder={openLocation === "Backup_Screen" ? "Choose password" : "Enter password"}
                                secureTextEntry={secureText1}
                                rightIcon={secureText1 ? "eye-off" : "eye"}
                                onIconPress={() => setsecureText1(prev => !prev)}
                                value={password1}
                                setValue={(s: string) =>
                                    openLocation === "Backup_Screen" ? handlePasswordChange(s) : setPassword1(s)
                                }
                            />

                            {openLocation === "Backup_Screen" && <PasswordStrengthIndicator strength={strength} />}

                            {openLocation === "Backup_Screen" && (
                                <>
                                    <BaseSpacer height={24} />
                                    <BaseTextInput
                                        placeholder="Confirm password"
                                        secureTextEntry={secureText2}
                                        rightIcon={secureText2 ? "eye-off" : "eye"}
                                        onIconPress={() => setsecureText2(prev => !prev)}
                                        value={password2}
                                        setValue={setPassword2}
                                    />

                                    <BaseView justifyContent="flex-start" alignItems="flex-start" my={8}>
                                        <BaseText color={COLORS.DARK_RED} mt={4}>
                                            {passwordMisMatch && "* Passwords do not match"}
                                        </BaseText>

                                        <BaseText color={COLORS.DARK_RED} mt={4}>
                                            {passwordNotStrong && "* Password is not strong enough"}
                                        </BaseText>
                                    </BaseView>
                                </>
                            )}
                        </BaseView>
                    }
                    footer={
                        <>
                            <BaseButton title="Proceed" action={checkPasswordValidity} />
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
