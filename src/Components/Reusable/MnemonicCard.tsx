import React, { FC, useCallback, useState } from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { BaseText, BaseView } from "~Components/Base"
import { BlurView } from "./BlurView"
import { PlatformUtils, useTheme } from "~Common"
import { HideView } from "./HideView.android"
import { Fonts } from "~Model"
import DropShadow from "react-native-drop-shadow"

type Props = {
    mnemonicArray: string[]
}

export const MnemonicCard: FC<Props> = ({ mnemonicArray }) => {
    const theme = useTheme()

    const [Show, setShow] = useState(false)
    const toggleShow = useCallback(() => setShow(prevState => !prevState), [])

    return (
        <DropShadow style={[theme.shadows.card]}>
            <TouchableWithoutFeedback onPress={toggleShow}>
                <BaseView
                    orientation="row"
                    align="center"
                    background={theme.colors.card}>
                    <BaseView
                        radius={16}
                        px={16}
                        py={12}
                        style={baseStyles.box}
                        orientation="row"
                        wrap
                        w={92}
                        justify="space-between">
                        {mnemonicArray.map((word, index) => (
                            <BaseText
                                font={Fonts.footnote_accent}
                                key={`word${index}`}
                                my={8}
                                w={33}>{`${index + 1}. ${word}`}</BaseText>
                        ))}

                        {!Show && PlatformUtils.isIOS() && (
                            <BlurView cornerRadius={12} />
                        )}
                        {!Show && PlatformUtils.isAndroid() && (
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
                        <Icon
                            name={Show ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color={
                                theme.isDark
                                    ? theme.colors.tertiary
                                    : theme.colors.card
                            }
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
    },
    button: {
        height: "100%",
        borderTopRightRadius: 16,
        borderBottomEndRadius: 16,
    },
})
