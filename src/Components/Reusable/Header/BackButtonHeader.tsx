import { useNavigation } from "@react-navigation/native"
import React, { useCallback, ReactNode } from "react"
import { StyleProp, View, ViewProps } from "react-native"
import { BaseIcon, BaseSpacer, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { HeaderStyle } from "./utils/HeaderStyle"
import { HeaderTitle } from "./HeaderTitle"
import { HeaderRightIconGroup } from "./HeaderRightIconGroup"

type Props = {
    iconTestID?: string
    title?: string
    hasBottomSpacer?: boolean
    iconColor?: string
    beforeNavigating?: () => Promise<void> | void
    action?: () => void
    onGoBack?: () => void
    preventGoBack?: boolean
    iconStyle?: StyleProp<ViewProps>
    rightElement?: ReactNode
} & ViewProps

export const BackButtonHeader = ({
    iconTestID = "BackButtonHeader-BaseIcon-backButton",
    hasBottomSpacer = true,
    title,
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
        <View {...otherProps}>
            <BaseView>
                <BaseView
                    flexDirection="row"
                    w={100}
                    style={HeaderStyle.headerContainer}
                    justifyContent="space-between">
                    <BaseIcon
                        haptics="Light"
                        style={[iconStyle]}
                        size={24}
                        name="icon-arrow-left"
                        color={iconColor ?? theme.colors.title}
                        action={onActionPress}
                        testID={iconTestID}
                    />
                    {!!title && <HeaderTitle title={title} />}
                    <HeaderRightIconGroup rightElement={rightElement} />
                </BaseView>
                {hasBottomSpacer && <BaseSpacer height={24} />}
            </BaseView>
        </View>
    )
}
