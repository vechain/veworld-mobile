import React, { useCallback } from "react"
import { StyleSheet, ViewProps, View } from "react-native"
import { BaseIcon, BaseSpacer } from "~Components/Base"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "~Hooks"

type Props = {
    iconTestID?: string
    hasBottomSpacer?: boolean
    iconColor?: string
    action?: () => void
} & ViewProps

export const BackButtonHeader = ({
    iconTestID = "BackButtonHeader-BaseIcon-backButton",
    hasBottomSpacer = true,
    iconColor,
    action,
    ...otherProps
}: Props) => {
    const nav = useNavigation()
    const theme = useTheme()

    const onActionPress = useCallback(async () => {
        if (action) {
            action()
        } else {
            nav.goBack()
        }
    }, [nav, action])

    return (
        <View {...otherProps}>
            <BaseIcon
                haptics="Light"
                style={backButtonHeaderStyle.backButton}
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
