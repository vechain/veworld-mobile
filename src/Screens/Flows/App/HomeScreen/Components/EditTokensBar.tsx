import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectNonVechainTokensWithBalances, useAppSelector } from "~Storage/Redux"

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

    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)

    const getActionsButtons = useCallback(() => {
        if (!isEdit)
            return (
                <BaseView flexDirection="row">
                    {tokenBalances.length > 1 && (
                        <>
                            <BaseIcon
                                disabled={true}
                                haptics="Light"
                                name="icon-list-end"
                                action={onButtonPress}
                                size={20}
                                p={10}
                                color={theme.colors.transparent}
                            />
                            <BaseSpacer width={8} />
                        </>
                    )}
                    <BaseIcon
                        p={10}
                        haptics="Light"
                        name="icon-settings-2"
                        color={theme.colors.text}
                        action={handleManageToken}
                        size={20}
                        testID="EditTokensBar_BaseIcon_manageToken"
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
    }, [
        isEdit,
        tokenBalances.length,
        onButtonPress,
        theme.colors.transparent,
        theme.colors.text,
        handleManageToken,
        LL,
    ])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
            <BaseText typographyFont="bodySemiBold">{LL.SB_MY_TOKENS()}</BaseText>

            {getActionsButtons()}
        </BaseView>
    )
})
