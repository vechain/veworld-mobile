/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useOnDigitPress } from "../LockScreen/useOnDigitPress"
import { PinVerificationError, PinVerificationErrorType } from "~Model"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, Text, View } from "react-native"
import { PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { StandaloneNumPad, StandalonePasswordPins } from "./components"
import { useThemedStyles } from "~Hooks"
import RNBootSplash from "react-native-bootsplash"

type Props = {
    onPinInserted: (pin: string) => Promise<void>
}

type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const StandaloneLockScreen: React.FC<Props> = memo(
    ({ onPinInserted }) => {
        const [isError, setIsError] = useState<PinVerificationErrorType>({
            type: undefined,
            value: false,
        })

        const { LL } = useI18nContext()

        const { styles } = useThemedStyles(baseStyles)

        useEffect(() => {
            RNBootSplash.hide({ fade: true, duration: 500 })
        }, [])

        /**
         * Called by `useOnDigitPress` when the user has finished typing the pin
         * Validates the user pin and calls `onSuccess` if the pin is valid
         * otherwise sets `isError` to true
         */
        const validateUserPin = useCallback(
            async (userPin: string) => {
                try {
                    await onPinInserted(userPin)
                } catch (err) {
                    setIsError({
                        type: PinVerificationError.VALIDATE_PIN,
                        value: true,
                    })
                }
            },
            [onPinInserted],
        )

        const { pin, onDigitPress, onDigitDelete } = useOnDigitPress({
            digitNumber,
            onFinishCallback: validateUserPin,
            resetPinOnFinishTimer: 300,
        })

        const handleOnDigitPress = useCallback(
            (digit: string) => {
                setIsError({ type: undefined, value: false })
                onDigitPress(digit)
            },
            [onDigitPress],
        )

        const { title, subTitle }: Titles = useMemo(() => {
            return {
                title: LL.TITLE_USER_PIN(),
                subTitle: LL.SB_UNLOCK_WALLET_PIN(),
            }
        }, [LL])

        return (
            <SafeAreaView
                style={[
                    PlatformUtils.isAndroid() ? styles.androidTopPadding : {},
                    styles.safeArea,
                ]}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subTitle}>{subTitle}</Text>
                    </View>

                    <View style={{ marginTop: isSmallScreen ? 32 : 62 }} />

                    <StandalonePasswordPins
                        digitNumber={digitNumber}
                        pin={pin}
                        isPinError={isError}
                    />

                    <StandaloneNumPad
                        onDigitPress={handleOnDigitPress}
                        onDigitDelete={onDigitDelete}
                    />
                </View>
            </SafeAreaView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        safeArea: {
            paddingBottom: 0,
            flexGrow: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            alignItems: "center",
            marginHorizontal: 24,
            marginTop: 20,
        },
        titleContainer: {
            alignSelf: "flex-start",
        },
        title: {
            fontSize: 22,
            fontWeight: "700",
            lineHeight: 28,
            color: theme.colors.text,
        },
        subTitle: {
            fontSize: 14,
            fontWeight: "400",
            marginVertical: 10,
            color: theme.colors.text,
        },
        androidTopPadding: {
            paddingTop: 12,
        },
    })
