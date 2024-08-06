import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { useDisclosure } from "~Hooks"
import HapticsService from "~Services/HapticsService"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"
import { PlatformBlur } from "~Components"

type Props = {
    mnemonicArray: string[]
}

export const MnemonicCard: FC<Props> = ({ mnemonicArray }) => {
    const { isOpen: isShow, onToggle: toggleShow } = useDisclosure()
    const { LL } = useI18nContext()

    const iconColor = useMemo(() => COLORS.WHITE, [])

    const onPress = useCallback(async () => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleShow()
    }, [toggleShow])

    return (
        <BaseView>
            <TouchableWithoutFeedback onPress={onPress}>
                <BaseView flexDirection="row" w={100} borderRadius={16} bg={COLORS.WHITE}>
                    <BaseView
                        px={16}
                        py={12}
                        style={[styles.box]}
                        flexDirection="row"
                        flexWrap="wrap"
                        w={92}
                        justifyContent="space-between">
                        {mnemonicArray.map((word, index) => {
                            return (
                                <BaseText
                                    typographyFont="footNoteAccent"
                                    key={`word${index}`}
                                    my={8}
                                    w={33}
                                    testID={`word-${index}`}>{`${index + 1}. ${word}`}</BaseText>
                            )
                        })}
                        {!isShow && <PlatformBlur backgroundColor={COLORS.LIGHT_GRAY} text={LL.TAP_TO_VIEW()} />}
                    </BaseView>

                    <BaseView
                        w={8}
                        px={16}
                        py={12}
                        style={styles.button}
                        justifyContent="center"
                        alignItems="center"
                        bg={COLORS.DARK_PURPLE}>
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
