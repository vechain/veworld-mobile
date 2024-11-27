import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { View, ViewProps } from "react-native"
import { useTheme } from "~Hooks"

type Props = {
    iconTestID?: string
    title?: string
    beforeNavigating?: () => Promise<void> | void
    action?: () => void
    onGoBack?: () => void
} & ViewProps

export const BackButtonHeaderV2 = ({
    title,
    beforeNavigating,
    onGoBack,
    action,
    iconTestID = "BackButtonHeader2-BaseIcon-backButton",
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
        <View>
            <BaseView>
                <BaseSpacer height={12} />
                <BaseView flexDirection="row" w={100} px={8} py={4} justifyContent="space-between">
                    <BaseIcon
                        haptics="Light"
                        action={onActionPress}
                        name="arrow-left"
                        size={24}
                        color={theme.colors.text}
                        testID={iconTestID}
                    />
                    <BaseText typographyFont="subTitleBold">{title}</BaseText>
                    <BaseSpacer width={24} />
                </BaseView>
                <BaseSpacer height={4} />
            </BaseView>
        </View>
    )
}
