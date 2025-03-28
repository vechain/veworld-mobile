import { useNavigation } from "@react-navigation/native"
import React, { ReactNode, useCallback } from "react"
import { StyleProp, ViewProps } from "react-native"
import { BaseIcon, BaseSpacer, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { HeaderStyle } from "./Constants"

type Props = {
    iconTestID?: string
    hasBottomSpacer?: boolean
    iconColor?: string
    beforeNavigating?: () => Promise<void> | void
    action?: () => void
    onGoBack?: () => void
    preventGoBack?: boolean
    iconStyle?: StyleProp<ViewProps>
    rightElement?: ReactNode
} & ViewProps

export const BackButtonGenericHeader = ({
    iconTestID = "BackButtonGenericHeader-BaseIcon-backButton",
    hasBottomSpacer = true,
    iconColor,
    beforeNavigating,
    onGoBack,
    preventGoBack = false,
    action,
    iconStyle,
    rightElement,
    ...otherProps
}: Props) => {
    const nav = useNavigation()
    const theme = useTheme()

    const onActionPress = useCallback(async () => {
        if (preventGoBack) return
        if (beforeNavigating) await beforeNavigating()

        if (action) {
            action()
        } else {
            nav.goBack()
            onGoBack?.()
        }
    }, [preventGoBack, beforeNavigating, action, nav, onGoBack])

    return (
        <BaseView {...otherProps}>
            <BaseView flexDirection="row" w={100} style={HeaderStyle} justifyContent="space-between">
                <BaseIcon
                    haptics="Light"
                    style={[iconStyle]}
                    size={24}
                    name="icon-arrow-left"
                    color={iconColor ?? theme.colors.title}
                    action={onActionPress}
                    testID={iconTestID}
                />
                {rightElement}
            </BaseView>
            {hasBottomSpacer && <BaseSpacer height={24} />}
        </BaseView>
    )
}
