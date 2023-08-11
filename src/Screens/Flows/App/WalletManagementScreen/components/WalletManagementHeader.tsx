import React from "react"
import { useTheme } from "~Hooks"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"

type Props = {
    isEdit: boolean
    setIsEdit: (s: boolean) => void
    openCreateWalletOrAccountBottomSheet: () => void
}
export const WalletManagementHeader = ({
    isEdit,
    setIsEdit,
    openCreateWalletOrAccountBottomSheet,
}: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseText typographyFont="title">
                {LL.TITLE_WALLET_MANAGEMENT()}
            </BaseText>
            <BaseView flexDirection="row">
                {isEdit ? (
                    <BaseButton
                        haptics="Light"
                        action={() => setIsEdit(false)}
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
                ) : (
                    <>
                        <BaseIcon
                            haptics="Light"
                            name="priority-low"
                            action={() => setIsEdit(true)}
                            size={24}
                            color={theme.colors.text}
                        />
                        <BaseSpacer width={16} />
                        <BaseIcon
                            haptics="Light"
                            size={24}
                            name="plus"
                            bg={theme.colors.secondary}
                            action={openCreateWalletOrAccountBottomSheet}
                        />
                    </>
                )}
            </BaseView>
        </BaseView>
    )
}
