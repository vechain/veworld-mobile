import React, { useCallback } from "react"
import { StyleProp, StyleSheet, View, ViewProps } from "react-native"
import { BaseIcon, BaseSpacer } from "~Components/Base"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Hooks"

type Props = {
    iconTestID?: string
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
            <BaseIcon
                haptics="Light"
                style={[backButtonHeaderStyle.backButton, iconStyle]}
                size={36}
                name="chevron-left"
                color={iconColor ? iconColor : theme.colors.text}
                action={onActionPress}
                testID={iconTestID}
            />
            {hasBottomSpacer && <BaseSpacer height={16} />}
        </View>
    )
}

const backButtonHeaderStyle = StyleSheet.create({
    backButton: { paddingHorizontal: 12, alignSelf: "flex-start" },
})
