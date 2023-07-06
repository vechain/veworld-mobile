import React from "react"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import * as Clipboard from "expo-clipboard"
import PlatformUtils from "~Utils/PlatformUtils" // TODO (Davide) (https://github.com/vechainfoundation/veworld-mobile/issues/748) remove this circular dependency

interface Props {
    onPaste: (result: string) => void
}

export const CameraFooter = ({ onPaste }: Props) => {
    const onPress = async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let text = await Clipboard.getStringAsync()
            onPaste(text)
        }
    }

    return (
        <BaseView
            flexDirection="row"
            style={baseStyles.container}
            justifyContent="center"
            w={100}
            alignItems="center">
            <BaseTouchable action={() => onPress()}>
                <BaseText typographyFont="subTitle" color="white">
                    {"Paste from clipboard"}
                </BaseText>
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: PlatformUtils.isIOS() ? 120 : 40,
        marginTop: PlatformUtils.isIOS() ? 60 : 20,
    },
    icon: {
        position: "absolute",
        left: PlatformUtils.isIOS() ? 20 : 8,
    },
})
