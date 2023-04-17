import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

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

    const handleManageToken = useCallback(
        () => nav.navigate(Routes.MANAGE_TOKEN),
        [nav],
    )

    const getActionsButtons = useCallback(() => {
        if (!isEdit)
            return (
                <BaseView flexDirection="row">
                    <BaseIcon
                        name="priority-low"
                        action={onButtonPress}
                        size={24}
                        color={theme.colors.text}
                    />
                    <BaseSpacer width={18} />
                    <BaseIcon
                        name="pencil-outline"
                        bg={COLORS.LIME_GREEN}
                        color={COLORS.DARK_PURPLE}
                        action={handleManageToken}
                        size={24}
                    />
                </BaseView>
            )
        return (
            <BaseButton
                action={onButtonPress}
                bgColor={COLORS.LIME_GREEN}
                textColor={COLORS.DARK_PURPLE}
                radius={30}
                py={10}
                leftIcon={
                    <BaseIcon
                        name="check"
                        size={20}
                        color={COLORS.DARK_PURPLE}
                    />
                }>
                <BaseSpacer width={8} />
                {LL.COMMON_BTN_SAVE()}
            </BaseButton>
        )
    }, [isEdit, onButtonPress, theme.colors.text, handleManageToken, LL])

    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            px={20}>
            <BaseText typographyFont="subTitleBold">
                {LL.SB_YOUR_TOKENS()}
            </BaseText>

            {getActionsButtons()}
        </BaseView>
    )
})
