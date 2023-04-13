import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useTheme } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectCustomNetworks, useAppSelector } from "~Storage/Redux"

type Props = {
    openBottomSheet: () => void
}
export const CustomNodes: React.FC<Props> = ({ openBottomSheet }) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const onAddCustomPress = useCallback(
        () => nav.navigate(Routes.SETTINGS_ADD_CUSTOM_NODE),
        [nav],
    )

    const customNodes = useAppSelector(selectCustomNetworks)

    return (
        <>
            <BaseText typographyFont="bodyMedium">
                {LL.BD_CUSTOM_NODES()}
            </BaseText>
            <BaseSpacer height={8} />

            <BaseText typographyFont="captionRegular">
                {LL.BD_CUSTOM_NODES_DESC()}
            </BaseText>

            <BaseSpacer height={16} />

            {customNodes.length ? (
                <BaseTouchableBox
                    action={openBottomSheet}
                    justifyContent="center">
                    <BaseIcon name="tune" color={theme.colors.primary} />
                    <BaseText px={8} typographyFont="buttonSecondary">
                        {LL.NETWORK_MANAGE_NODES()}
                    </BaseText>
                    <BaseView
                        bg={theme.colors.primary}
                        borderRadius={6}
                        px={4}
                        py={2}>
                        <BaseText
                            typographyFont="smallCaptionMedium"
                            color={theme.colors.primaryReversed}>
                            {customNodes.length}
                        </BaseText>
                    </BaseView>
                </BaseTouchableBox>
            ) : (
                <BaseTouchableBox
                    action={onAddCustomPress}
                    justifyContent="center">
                    <BaseIcon name="plus" color={theme.colors.text} />
                    <BaseText pl={8} typographyFont="buttonSecondary">
                        {LL.NETWORK_ADD_CUSTOM_NODE()}
                    </BaseText>
                </BaseTouchableBox>
            )}
        </>
    )
}
