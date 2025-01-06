import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { StyleSheet } from "react-native"

type Props = {
    isEdit: boolean
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>
}

export const EditTokensBar = memo(({ isEdit, setIsEdit }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const onButtonPress = useCallback(() => {
        setIsEdit(prevState => !prevState)
    }, [setIsEdit])

    const nav = useNavigation()

    const handleManageToken = useCallback(() => {
        setTimeout(() => {
            nav.navigate(Routes.MANAGE_TOKEN)
        }, 0)
    }, [nav])

    const getActionsButtons = useCallback(() => {
        if (!isEdit)
            return (
                <BaseView flexDirection="row">
                    <BaseIcon
                        haptics="Light"
                        name="icon-settings-2"
                        color={theme.colors.text}
                        action={handleManageToken}
                        size={20}
                        testID="EditTokensBar_BaseIcon_manageToken"
                        style={styles.icon}
                    />
                </BaseView>
            )
        return (
            <BaseButton
                haptics="Light"
                action={onButtonPress}
                bgColor={COLORS.LIME_GREEN}
                textColor={COLORS.DARK_PURPLE}
                radius={30}
                py={10}
                leftIcon={<BaseIcon name="icon-check" size={20} color={COLORS.DARK_PURPLE} />}>
                <BaseSpacer width={8} />
                {LL.COMMON_BTN_SAVE()}
            </BaseButton>
        )
    }, [isEdit, onButtonPress, theme.colors.text, handleManageToken, LL])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" px={20}>
            <BaseText typographyFont="bodySemiBold">{LL.SB_MY_TOKENS()}</BaseText>

            {getActionsButtons()}
        </BaseView>
    )
})

const styles = StyleSheet.create({
    icon: {
        padding: 10,
    },
})
