import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { useDisclosure, useTheme } from "~Hooks"
import HapticsService from "~Services/HapticsService"
import { PlatformBlur } from "./PlatformBlur"
import { useI18nContext } from "~i18n"
import { error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

type Props = {
    mnemonicArray: string[]
    setIsMissingWord?: React.Dispatch<React.SetStateAction<boolean>>
}

export const MnemonicCard: FC<Props> = ({ mnemonicArray, setIsMissingWord }) => {
    const { isOpen: isShow, onToggle: toggleShow } = useDisclosure()

    const theme = useTheme()
    const { LL } = useI18nContext()

    const iconColor = useMemo(() => (theme.isDark ? theme.colors.tertiary : theme.colors.card), [theme])

    const onPress = useCallback(async () => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleShow()
    }, [toggleShow])

    const RenderWords = useMemo(() => {
        return mnemonicArray.map((word, index) => {
            if (mnemonicArray.length !== 12) {
                error(ERROR_EVENTS.MNEMONIC, "UI MnemonicCard Array has missing words")
                setIsMissingWord && setIsMissingWord(true)
            }

            if (word && word.length < 1) {
                error(ERROR_EVENTS.MNEMONIC, "UI MnemonicCard Word is Empty")
                setIsMissingWord && setIsMissingWord(true)
            }

            if (word && typeof word !== "string") {
                error(ERROR_EVENTS.MNEMONIC, "UI MnemonicCard Word is not a valid string")
                setIsMissingWord && setIsMissingWord(true)
            }

            return (
                <BaseText
                    typographyFont="footNoteAccent"
                    key={`word${index}`}
                    my={8}
                    w={33}
                    testID={`word-${index}`}>{`${index + 1}. ${word}`}</BaseText>
            )
        })
    }, [mnemonicArray, setIsMissingWord])

    return (
        <BaseView>
            <TouchableWithoutFeedback onPress={onPress}>
                <BaseView flexDirection="row" w={100} borderRadius={16} bg={theme.colors.card}>
                    <BaseView
                        px={16}
                        py={12}
                        style={[styles.box]}
                        flexDirection="row"
                        flexWrap="wrap"
                        w={92}
                        justifyContent="space-between">
                        {RenderWords}
                        {!isShow && <PlatformBlur backgroundColor={theme.colors.card} text={LL.TAP_TO_VIEW()} />}
                    </BaseView>

                    <BaseView
                        w={8}
                        px={16}
                        py={12}
                        style={styles.button}
                        justifyContent="center"
                        alignItems="center"
                        bg={theme.colors.primary}>
                        <BaseIcon
                            name={isShow ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color={iconColor}
                            style={styles.icon}
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
        borderTopLeftRadius: 16,
        borderBottomStartRadius: 16,
        overflow: "hidden",
    },
    button: {
        flexGrow: 1,
        borderTopRightRadius: 16,
        borderBottomEndRadius: 16,
    },
    icon: { flex: 1, width: 100 },
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
