import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useTheme } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectCustomNetworks, useAppSelector } from "~Storage/Redux"

type Props = {
    onManageNodesClick: () => void
}
export const CustomNodes: React.FC<Props> = ({ onManageNodesClick }) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const onAddCustomPress = useCallback(() => nav.navigate(Routes.SETTINGS_ADD_CUSTOM_NODE), [nav])

    const customNodes = useAppSelector(selectCustomNetworks)

    return (
        <>
            <BaseText typographyFont="bodyMedium">{LL.BD_CUSTOM_NODES()}</BaseText>
            <BaseSpacer height={8} />

            <BaseText typographyFont="captionRegular">{LL.BD_CUSTOM_NODES_DESC()}</BaseText>

            <BaseSpacer height={16} />

            {customNodes.length ? (
                <BaseTouchableBox haptics="Light" action={onManageNodesClick} justifyContent="center">
                    <BaseView flexDirection="row" alignItems="center" gap={8}>
                        <BaseIcon name="icon-settings-2" color={theme.colors.text} />
                        <BaseText typographyFont="buttonSecondary">{LL.NETWORK_MANAGE_NODES()}</BaseText>
                        <BaseView
                            bg={theme.isDark ? theme.colors.secondary : theme.colors.primary}
                            borderRadius={8}
                            px={4}
                            py={2}>
                            <BaseText typographyFont="captionSemiBold" color={theme.colors.textReversed}>
                                {customNodes.length}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseTouchableBox>
            ) : (
                <BaseTouchableBox haptics="Light" action={onAddCustomPress} justifyContent="center">
                    <BaseIcon name="icon-plus" color={theme.colors.text} />
                    <BaseText pl={8} typographyFont="buttonSecondary">
                        {LL.NETWORK_ADD_CUSTOM_NODE()}
                    </BaseText>
                </BaseTouchableBox>
            )}
        </>
    )
}
