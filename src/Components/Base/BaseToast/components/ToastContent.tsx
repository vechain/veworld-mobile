import React, { useCallback } from "react"
import { BaseIcon, BaseText, BaseView, hideToast, IconKey, ToastAddress } from "~Components"
import { useTheme } from "~Hooks"
import { ToastStyles } from "../util"
import { ToastAddressesContent } from "./ToastAddressesContent"

type Props = {
    styles: ToastStyles
    icon: IconKey
    text1?: string
    text2?: string
    text3?: string
    addresses?: ToastAddress
    onPress?: () => void
    hideToast?: () => void
    testID?: string
}

export const ToastContent = ({ styles, text1, icon, text2, text3, addresses, onPress, testID }: Props) => {
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
                <BaseIcon name={icon} size={20} color={styles.iconColor} />
                <BaseView>
                    <BaseView style={styles.textContainer} px={12}>
                        {addresses && (
                            <ToastAddressesContent addresses={addresses} styles={styles.addressesTextColor} />
                        )}

                        <BaseView flexDirection="row" flex={1} flexWrap="wrap">
                            <BaseText color={textColor} typographyFont="bodyMedium">
                                {text1}{" "}
                            </BaseText>
                            {text2 && (
                                <BaseText color={textColor} typographyFont="body">
                                    {text2}{" "}
                                </BaseText>
                            )}
                        </BaseView>

                        {text3 && (
                            <BaseText
                                testID={testID}
                                disabled={!onPress}
                                underline={onPress ? true : false}
                                onPress={handleOnPress}
                                color={textColor}
                                typographyFont="body">
                                {text3} <BaseIcon name="icon-arrow-link" color={textColor} size={12} />
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}
