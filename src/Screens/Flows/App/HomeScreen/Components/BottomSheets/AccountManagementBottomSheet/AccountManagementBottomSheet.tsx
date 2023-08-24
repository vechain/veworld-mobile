import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useCopyClipboard, useTheme } from "~Hooks"
import { info } from "~Utils"
import {
    BaseBottomSheet,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    showErrorToast,
    showSuccessToast,
} from "~Components"

import { useI18nContext } from "~i18n"
import {
    addAccountForDevice,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectDevices, selectSelectedAccount } from "~Storage/Redux/Selectors"

type Props = {
    onClose: () => void
    openAddAccountSheet: () => void
    openQRCodeSheet: () => void
    openRenameAccountBottomSheet: () => void
    openRemoveAccountBottomSheet: () => void
}

export const AccountManagementBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            onClose,
            openAddAccountSheet,
            openQRCodeSheet,
            openRenameAccountBottomSheet,
            openRemoveAccountBottomSheet,
        },
        ref,
    ) => {
        const theme = useTheme()
        const { LL } = useI18nContext()

        const snapPoints = useMemo(() => ["50%"], [])
        const selectedAccount = useAppSelector(selectSelectedAccount)
        const devices = useAppSelector(selectDevices)
        const dispatch = useAppDispatch()

        const handleSheetChanges = useCallback((index: number) => {
            info("accountManagementSheet position changed", index)
        }, [])

        const onAddAccount = useCallback(() => {
            onClose()
            if (devices.length === 1) {
                try {
                    dispatch(addAccountForDevice(devices[0]))
                    showSuccessToast(
                        LL.WALLET_MANAGEMENT_NOTIFICATION_CREATE_ACCOUNT_SUCCESS(),
                    )
                } catch (e) {
                    showErrorToast(
                        LL.WALLET_MANAGEMENT_NOTIFICATION_CREATE_ACCOUNT_ERROR(),
                    )
                }
            } else {
                openAddAccountSheet()
            }
        }, [LL, devices, dispatch, onClose, openAddAccountSheet])

        const { onCopyToClipboard } = useCopyClipboard()

        const handleOnQRcodePress = useCallback(() => {
            onClose()
            openQRCodeSheet()
        }, [onClose, openQRCodeSheet])

        const handleOnRenameAccountPress = useCallback(() => {
            onClose()
            openRenameAccountBottomSheet()
        }, [onClose, openRenameAccountBottomSheet])

        const handleOnRemoveAccountPress = useCallback(() => {
            onClose()
            openRemoveAccountBottomSheet()
        }, [onClose, openRemoveAccountBottomSheet])

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                ref={ref}>
                <BaseView
                    flexDirection="row"
                    w={100}
                    justifyContent="space-between">
                    <BaseText typographyFont="subTitleBold">
                        {LL.SB_ACCOUNT_MANAGEMENT()}
                    </BaseText>
                    <BaseIcon
                        haptics="Light"
                        name={"plus"}
                        size={32}
                        bg={theme.colors.secondary}
                        action={onAddAccount}
                        testID="AccountManagementBottomSheet_addAccountButton"
                    />
                </BaseView>

                <BaseSpacer height={24} />

                <BaseTouchableBox
                    haptics="Light"
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

                <BaseTouchableBox action={handleOnQRcodePress} haptics="Light">
                    <BaseIcon
                        name={"qrcode"}
                        size={18}
                        color={theme.colors.text}
                    />
                    <BaseText mx={8}>{LL.BTN_SHOW_QR_CODE()}</BaseText>
                </BaseTouchableBox>

                <BaseSpacer height={16} />

                <BaseTouchableBox action={handleOnRenameAccountPress}>
                    <BaseIcon
                        name={"account-edit"}
                        size={18}
                        color={theme.colors.text}
                    />
                    <BaseText mx={8}>{LL.BTN_RENAME_ACCOUNT()}</BaseText>
                </BaseTouchableBox>

                <BaseSpacer height={16} />

                <BaseTouchableBox action={handleOnRemoveAccountPress}>
                    <BaseIcon
                        name={"trash-can-outline"}
                        size={18}
                        color={theme.colors.text}
                    />
                    <BaseText mx={8}>{LL.BTN_REMOVE_ACCOUNT()}</BaseText>
                </BaseTouchableBox>
            </BaseBottomSheet>
        )
    },
)
