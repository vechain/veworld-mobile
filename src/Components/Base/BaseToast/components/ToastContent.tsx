import React, { useCallback } from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseView, hideToast } from "~Components"
import { useTheme } from "~Hooks"
import { ToastStyles } from "../util"
import { COLORS } from "~Constants"

type Props = {
    styles: ToastStyles
    icon: string
    text1?: string
    text2?: string
    text3?: string
    onPress?: () => void
    hideToast?: () => void
    testID?: string
}

export const ToastContent = ({ styles, text1, icon, text2, text3, onPress, testID }: Props) => {
    const theme = useTheme()

    const handleOnPress = useCallback(() => {
        if (onPress) {
            onPress()
            hideToast?.()
        }
    }, [onPress])

    const textColor = styles.textColor ?? theme.colors.textReversed

    return (
        <BaseView style={styles.container}>
            <BaseView style={styles.contentContainer}>
                <BaseIcon name={icon} size={16} color={styles.iconColor} />
                <BaseSpacer width={12} />
                <BaseView>
                    <BaseView style={styles.textContainer}>
                        <BaseText color={text2 ? COLORS.GREY_600 : textColor} typographyFont="captionMedium">
                            {text1}
                        </BaseText>
                        {text2 && (
                            <>
                                <BaseSpacer height={4} />
                                <BaseText color={textColor} typographyFont="captionMedium">
                                    {text2}
                                </BaseText>
                            </>
                        )}
                        {text3 && (
                            <BaseText
                                testID={testID}
                                disabled={!onPress}
                                underline={onPress ? true : false}
                                onPress={handleOnPress}
                                color={textColor}
                                typographyFont="body">
                                {text3}
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}
