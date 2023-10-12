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
import { selectDevices, useAppSelector } from "~Storage/Redux"

type Props = {
    isEdit: boolean
    setIsEdit: (s: boolean) => void
    goToCreateWalletFlow: () => void
}
export const WalletManagementHeader = ({
    isEdit,
    setIsEdit,
    goToCreateWalletFlow,
}: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const devices = useAppSelector(selectDevices)

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
                        {devices.length > 1 && (
                            <>
                                <BaseIcon
                                    haptics="Light"
                                    name="priority-low"
                                    action={() => setIsEdit(true)}
                                    size={24}
                                    color={theme.colors.text}
                                />
                                <BaseSpacer width={16} />
                            </>
                        )}

                        <BaseButton
                            haptics="Light"
                            action={goToCreateWalletFlow}
                            bgColor={theme.colors.secondary}
                            textColor={COLORS.DARK_PURPLE}
                            radius={30}
                            py={10}
                            leftIcon={
                                <BaseIcon
                                    name="plus"
                                    size={20}
                                    color={COLORS.DARK_PURPLE}
                                />
                            }>
                            <BaseSpacer width={2} />
                            {LL.ADD_WALLET()}
                        </BaseButton>
                    </>
                )}
            </BaseView>
        </BaseView>
    )
}
