import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { info, useCopyClipboard, useTheme } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    BaseBottomSheet,
} from "~Components"

import { useI18nContext } from "~i18n"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedAccount } from "~Storage/Redux/Selectors"

type Props = {
    onClose: () => void
    openAddAccountSheet: () => void
}

export const AccountManagementBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, openAddAccountSheet }, ref) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["50%"], [])
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const handleSheetChanges = useCallback((index: number) => {
        info("accountManagementSheet position changed", index)
    }, [])

    const onAddAccount = useCallback(() => {
        onClose()
        openAddAccountSheet()
    }, [onClose, openAddAccountSheet])

    const { onCopyToClipboard } = useCopyClipboard()

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.SB_ACCOUNT_MANAGEMENT()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    size={32}
                    bg={theme.colors.secondary}
                    action={onAddAccount}
                />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseTouchableBox
                action={
                    selectedAccount
                        ? () =>
                              onCopyToClipboard(
                                  selectedAccount.address,
                                  LL.COMMON_LBL_ADDRESS(),
                              )
                        : undefined
                }>
                <BaseIcon
                    name={"content-copy"}
                    size={18}
                    color={theme.colors.text}
                    action={onAddAccount}
                />
                <BaseText mx={8}>{LL.BTN_COPY_PUBLIC_ADDRESS()}</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}} disabled>
                <BaseIcon name={"qrcode"} size={18} color={theme.colors.text} />
                <BaseText mx={8}>{LL.BTN_SHOW_QR_CODE()}</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}} disabled>
                <BaseIcon
                    name={"account-edit"}
                    size={18}
                    color={theme.colors.text}
                />
                <BaseText mx={8}>{LL.BTN_RENAME_ACCOUNT()}</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}} disabled>
                <BaseIcon
                    name={"trash-can-outline"}
                    size={18}
                    color={theme.colors.text}
                />
                <BaseText mx={8}>{LL.BTN_REMOVE_ACCOUNT()}</BaseText>
            </BaseTouchableBox>
        </BaseBottomSheet>
    )
})
