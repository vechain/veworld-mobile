/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { PinVerificationError, PinVerificationErrorType } from "~Model"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, Text, View } from "react-native"
import { PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { StandaloneNumPad, StandalonePasswordPins } from "./components"
import { useOnDigitPress, useThemedStyles } from "~Hooks"
import RNBootSplash from "react-native-bootsplash"

type Props = {
    onPinInserted: (pin: string) => Promise<void>
}

type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const StandaloneLockScreen: React.FC<Props> = memo(({ onPinInserted }) => {
    const [isError, setIsError] = useState<PinVerificationErrorType>({
        type: undefined,
        value: false,
    })

    const { LL } = useI18nContext()

    const { styles } = useThemedStyles(baseStyles)

    useEffect(() => {
        RNBootSplash.hide({ fade: true })
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
        <SafeAreaView style={[PlatformUtils.isAndroid() ? styles.androidTopPadding : {}, styles.safeArea]}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.subTitle}>{subTitle}</Text>
                <View style={{ marginTop: isSmallScreen ? 45 : 80 }} />
                <StandalonePasswordPins digitNumber={digitNumber} pin={pin} isPinError={isError} />
                <View style={{ marginTop: isSmallScreen ? 32 : 80 }} />
                <StandaloneNumPad onDigitPress={handleOnDigitPress} onDigitDelete={onDigitDelete} />
            </View>
        </SafeAreaView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        safeArea: {
            paddingBottom: 0,
            flexGrow: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            alignItems: "center",
            marginHorizontal: 16,
            marginTop: 16,
        },
        titleContainer: {
            alignSelf: "center",
            justifyContent: "center",
            width: "100%",
            height: 48,
        },
        title: {
            fontSize: 16,
            fontWeight: "600",
            lineHeight: 28,
            textAlign: "center",
            color: theme.colors.title,
        },
        subTitle: {
            fontSize: 14,
            fontWeight: "400",
            color: theme.colors.subtitle,
        },
        androidTopPadding: {
            paddingTop: 12,
        },
    })
