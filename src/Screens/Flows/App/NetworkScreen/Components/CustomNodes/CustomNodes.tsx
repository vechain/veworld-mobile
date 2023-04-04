import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback } from "react"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

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

            <BaseView flexDirection="row" justifyContent="space-between">
                <BaseTouchableBox
                    flex={1}
                    action={onAddCustomPress}
                    justifyContent="flex-start">
                    <BaseIcon name="plus" color={theme.colors.text} />
                    <BaseText pl={8} typographyFont="buttonSecondary">
                        {LL.NETWORK_ADD_NODE()}
                    </BaseText>
                </BaseTouchableBox>
                <BaseSpacer width={15} />
                <BaseTouchableBox
                    flex={1}
                    action={openBottomSheet}
                    justifyContent="flex-start">
                    <BaseIcon
                        name="format-list-bulleted"
                        color={theme.colors.text}
                    />
                    <BaseText pl={8} typographyFont="buttonSecondary">
                        {LL.NETWORK_MANAGE_NODES()}
                    </BaseText>
                </BaseTouchableBox>
            </BaseView>
        </>
    )
}
