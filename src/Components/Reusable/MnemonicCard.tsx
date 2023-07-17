import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { BlurView } from "./BlurView"
import { useDisclosure, useTheme } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { HideView } from "./HideView"
import HapticsService from "~Services/HapticsService"

type Props = {
    mnemonicArray: string[]
}

export const MnemonicCard: FC<Props> = ({ mnemonicArray }) => {
    const theme = useTheme()

    const { isOpen: isShow, onToggle: toggleShow } = useDisclosure()

    const iconColor = useMemo(
        () => (theme.isDark ? theme.colors.tertiary : theme.colors.card),
        [theme],
    )

    const onPress = useCallback(async () => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleShow()
    }, [toggleShow])

    return (
        <BaseView>
            <TouchableWithoutFeedback onPress={onPress}>
                <BaseView
                    flexDirection="row"
                    w={100}
                    borderRadius={16}
                    bg={theme.colors.card}>
                    <BaseView
                        px={16}
                        py={12}
                        style={baseStyles.box}
                        flexDirection="row"
                        flexWrap="wrap"
                        w={92}
                        justifyContent="space-between">
                        {mnemonicArray.map((word, index) => (
                            <BaseText
                                typographyFont="footNoteAccent"
                                key={`word${index}`}
                                my={8}
                                w={33}
                                testID={`word-${index}`}>{`${
                                index + 1
                            }. ${word}`}</BaseText>
                        ))}

                        {!isShow && PlatformUtils.isIOS() && <BlurView />}
                        {!isShow && PlatformUtils.isAndroid() && (
                            <HideView background={theme.colors.background} />
                        )}
                    </BaseView>

                    <BaseView
                        w={8}
                        px={16}
                        py={12}
                        style={baseStyles.button}
                        justifyContent="center"
                        alignItems="center"
                        bg={theme.colors.primary}>
                        <BaseIcon
                            name={isShow ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color={iconColor}
                            style={baseStyles.icon}
                            testID="toggle-mnemonic-visibility"
                        />
                    </BaseView>
                </BaseView>
            </TouchableWithoutFeedback>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
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
})
