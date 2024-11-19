import { useNavigation } from "@react-navigation/native"
import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { getTimeZone } from "react-native-localize"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ERROR_EVENTS } from "~Constants"
import { useDisclosure, useTheme } from "~Hooks"
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
    const theme = useTheme()
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
                    isBackup: true,
                    date: formattedDate,
                }),
            )
        }
    }, [deviceToBackup?.rootAddress, dispatch, locale, toggleShow])

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
                    color={COLORS.DARK_PURPLE}
                    key={`word${index}`}
                    my={2}
                    w={24}
                    align="center"
                    testID={`word-${index}`}>
                    {word}
                </BaseText>
            )
        })
    }, [mnemonicArray, nav, souceScreen])

    return (
        <BaseView>
            <TouchableWithoutFeedback onPress={onPress}>
                <BaseView flexDirection="row">
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
                                backgroundColor={theme.colors.card}
                                borderRadius={8}
                                text={LL.TAP_TO_VIEW()}
                            />
                        )}
                    </BaseView>

                    <BaseView py={12} style={styles.button} justifyContent="center" alignItems="center">
                        <BaseIcon
                            name={isShow ? "eye-off-outline" : "eye-outline"}
                            size={16}
                            style={styles.icon}
                            color={COLORS.GREY_500}
                            testID="toggle-mnemonic-visibility"
                        />
                    </BaseView>
                </BaseView>
            </TouchableWithoutFeedback>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    box: {
        flexShrink: 1,
        backgroundColor: COLORS.GREY_100,
        borderColor: COLORS.GREY_300,
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8,
        borderWidth: 1,
        overflow: "hidden",
    },
    button: {
        paddingHorizontal: 6,
        borderTopRightRadius: 8,
        borderBottomEndRadius: 8,
        borderWidth: 1,
        borderLeftWidth: 0,
        backgroundColor: COLORS.GREY_200,
        borderColor: COLORS.GREY_300,
    },
    icon: { flex: 1, color: COLORS.GREY_500 },
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
