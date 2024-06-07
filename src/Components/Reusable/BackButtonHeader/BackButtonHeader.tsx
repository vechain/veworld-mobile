import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleProp, View, ViewProps } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    iconTestID?: string
    text?: string
    hasBottomSpacer?: boolean
    iconColor?: string
    beforeNavigating?: () => Promise<void> | void
    action?: () => void
    onGoBack?: () => void
    iconStyle?: StyleProp<ViewProps>
} & ViewProps

export const BackButtonHeader = ({
    iconTestID = "BackButtonHeader-BaseIcon-backButton",
    hasBottomSpacer = true,
    text,
    iconColor,
    beforeNavigating,
    onGoBack,
    action,
    iconStyle,
    ...otherProps
}: Props) => {
    const nav = useNavigation()
    const theme = useTheme()

    const onActionPress = useCallback(async () => {
        if (beforeNavigating) await beforeNavigating()

        if (action) {
            action()
        } else {
            nav.goBack()
            onGoBack?.()
        }
    }, [beforeNavigating, action, nav, onGoBack])

    return (
        <View {...otherProps}>
            <BaseView flexDirection="row" alignItems="center">
                <BaseIcon
                    haptics="Light"
                    style={[iconStyle]}
                    px={12}
                    size={36}
                    name="chevron-left"
                    color={iconColor || theme.colors.text}
                    action={onActionPress}
                    testID={iconTestID}
                />
                {!!text && <BaseText typographyFont={"button"}>{text}</BaseText>}
            </BaseView>
            {hasBottomSpacer && <BaseSpacer height={16} />}
        </View>
    )
}
