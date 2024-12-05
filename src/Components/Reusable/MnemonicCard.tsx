import { useNavigation } from "@react-navigation/native"
import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { getTimeZone } from "react-native-localize"
import { BaseIconV2, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, ERROR_EVENTS } from "~Constants"
import { useDisclosure, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import HapticsService from "~Services/HapticsService"
import { setDeviceIsBackup, useAppDispatch } from "~Storage/Redux"
import { DateUtils, error } from "~Utils"
import { PlatformBlur } from "./PlatformBlur"

type Props = {
    mnemonicArray: string[]
    souceScreen?: string
    deviceToBackup?: LocalDevice
}

export const MnemonicCard: FC<Props> = ({ mnemonicArray, souceScreen, deviceToBackup }) => {
    const { isOpen: isShow, onToggle: toggleShow } = useDisclosure()

    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL, locale } = useI18nContext()
    const dispatch = useAppDispatch()

    const onPress = useCallback(async () => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleShow()
        if (deviceToBackup?.rootAddress) {
            const formattedDate = DateUtils.formatDateTime(
                Date.now(),
                locale,
                getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
            )
            dispatch(
                setDeviceIsBackup({
                    rootAddress: deviceToBackup.rootAddress,
                    isBackup: !!deviceToBackup.isBuckedUp,
                    isBackupManual: true,
                    date: formattedDate,
                }),
            )
        }
    }, [deviceToBackup?.rootAddress, deviceToBackup?.isBuckedUp, dispatch, locale, toggleShow])

    const RenderWords = useMemo(() => {
        if (mnemonicArray.length !== 12) {
            error(ERROR_EVENTS.MNEMONIC, `UI MnemonicCard Array has missing words from : ${souceScreen}`)
            setTimeout(() => {
                if (nav.canGoBack() && souceScreen === "BackupMnemonicBottomSheet") nav.goBack()
            }, 400)
        }

        return mnemonicArray.map((word, index) => {
            if (word && word.length < 1) {
                error(ERROR_EVENTS.MNEMONIC, `UI MnemonicCard Word is Empty from : ${souceScreen}`)
                setTimeout(() => {
                    if (nav.canGoBack() && souceScreen === "BackupMnemonicBottomSheet") nav.goBack()
                }, 400)
            }

            if (word && typeof word !== "string") {
                error(ERROR_EVENTS.MNEMONIC, `UI MnemonicCard Word is not a valid string from : ${souceScreen}`)
                setTimeout(() => {
                    if (nav.canGoBack() && souceScreen === "BackupMnemonicBottomSheet") nav.goBack()
                }, 400)
            }

            return (
                <BaseText
                    typographyFont="captionRegular"
                    color={theme.colors.text}
                    key={`word${index}`}
                    my={2}
                    w={24}
                    align="center"
                    testID={`word-${index}`}>
                    {word}
                </BaseText>
            )
        })
    }, [mnemonicArray, nav, souceScreen, theme.colors])

    return (
        <BaseView>
            <TouchableWithoutFeedback onPress={onPress}>
                <BaseView flexDirection="row" style={styles.container}>
                    <BaseView
                        px={8}
                        py={22}
                        style={[styles.box]}
                        flexDirection="row"
                        flexWrap="wrap"
                        justifyContent="space-between">
                        {RenderWords}
                        {!isShow && (
                            <PlatformBlur
                                backgroundColor={theme.colors.mnemonicCardBackground}
                                showTextOnIOS
                                text={LL.TAP_TO_VIEW()}
                            />
                        )}
                    </BaseView>

                    <BaseView style={styles.button} justifyContent="center" alignItems="center">
                        <BaseIconV2
                            name={isShow ? "icon-eye-off" : "icon-eye"}
                            size={16}
                            style={styles.icon}
                            color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                            testID="toggle-mnemonic-visibility"
                        />
                    </BaseView>
                </BaseView>
            </TouchableWithoutFeedback>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderRadius: 8,
            borderColor: theme.colors.mnemonicCardBorder,
            borderWidth: 1,
            overflow: "hidden",
        },
        box: {
            flexShrink: 1,
            backgroundColor: theme.colors.mnemonicCardBackground,
        },
        button: {
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 8,
            borderLeftWidth: 1,
            borderColor: theme.colors.mnemonicCardBorder,
            backgroundColor: theme.colors.toggleMnemonicButtonBackground,
        },
        icon: { flex: 1 },
        androidBlurContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        androidBlur: {
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
        },
    })
