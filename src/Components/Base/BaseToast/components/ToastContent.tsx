import React, { useCallback } from "react"
import { BaseIcon, BaseText, BaseView, hideToast } from "~Components"
import { ColorThemeType } from "~Common"
import { ToastStyles } from "../util"

type Props = {
    styles: ToastStyles
    icon: string
    iconColor: string
    text1?: string
    text2?: string
    text3?: string
    theme: ColorThemeType
    onPress?: () => void
    hideToast?: () => void
}

export const ToastContent = ({
    styles,
    text1,
    icon,
    iconColor,
    text2,
    text3,
    theme,
    onPress,
}: Props) => {
    const handleOnPress = useCallback(() => {
        if (onPress) {
            onPress()
            hideToast?.()
        }
    }, [onPress])

    return (
        <BaseView style={styles.container}>
            <BaseView style={styles.contentContainer}>
                <BaseIcon name={icon} size={20} color={iconColor} />
                <BaseView>
                    <BaseView style={styles.textContainer} pl={12}>
                        <BaseText
                            color={theme.colors.text}
                            typographyFont="bodyBold">
                            {text1}{" "}
                        </BaseText>
                        <BaseText
                            color={theme.colors.text}
                            typographyFont="body">
                            {text2}{" "}
                        </BaseText>
                        <BaseText
                            disabled={!onPress}
                            underline={onPress ? true : false}
                            onPress={handleOnPress}
                            color={theme.colors.text}
                            typographyFont="body">
                            {text3}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}
