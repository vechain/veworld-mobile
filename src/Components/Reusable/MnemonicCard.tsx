import React, { FC, useCallback, useState } from "react"
import { TouchableWithoutFeedback } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { BaseText, BaseView } from "~Components/Base"
import { BlurView } from "./BlurView"
import { PlatformUtils, useTheme } from "~Common"
import { HideView } from "./HideView.android"
import { Fonts } from "~Model"

type Props = {
    mnemonicArray: string[]
}

export const MnemonicCard: FC<Props> = ({ mnemonicArray }) => {
    const theme = useTheme()

    const [Show, setShow] = useState(false)
    const toggleShow = useCallback(() => setShow(prevState => !prevState), [])

    return (
        <TouchableWithoutFeedback onPress={toggleShow}>
            <BaseView
                orientation="row"
                align="center"
                background={theme.constants.lightGrey}>
                <BaseView
                    orientation="row"
                    wrap
                    w={92}
                    background={theme.colors.background}
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

                <BaseView w={8} justify="center" align="center">
                    <Icon
                        name={Show ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={theme.colors.button}
                    />
                </BaseView>
            </BaseView>
        </TouchableWithoutFeedback>
    )
}
