import React, { FC, useMemo } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { BlurView } from "./BlurView"
import { PlatformUtils, useDisclosure, useTheme } from "~Common"
import { HideView } from "./HideView.android"
import DropShadow from "react-native-drop-shadow"

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
    return (
        <DropShadow style={[theme.shadows.card]}>
            <TouchableWithoutFeedback onPress={toggleShow}>
                <BaseView
                    orientation="row"
                    w={100}
                    radius={16}
                    background={theme.colors.card}>
                    <BaseView
                        px={16}
                        py={12}
                        style={baseStyles.box}
                        orientation="row"
                        wrap
                        w={92}
                        justify="space-between">
                        {mnemonicArray.map((word, index) => (
                            <BaseText
                                typographyFont="footNoteAccent"
                                key={`word${index}`}
                                my={8}
                                w={33}>{`${index + 1}. ${word}`}</BaseText>
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
                        justify="center"
                        align="center"
                        background={theme.colors.primary}>
                        <BaseIcon
                            name={isShow ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color={iconColor}
                            style={{ width: 100, height: 100 }}
                        />
                    </BaseView>
                </BaseView>
            </TouchableWithoutFeedback>
        </DropShadow>
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
})
