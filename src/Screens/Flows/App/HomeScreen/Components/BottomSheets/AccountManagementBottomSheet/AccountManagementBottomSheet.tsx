import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { useTheme } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"

import * as Clipboard from "expo-clipboard"
import { Device, useRealm } from "~Storage"
import { Alert } from "react-native"
import { useI18nContext } from "~i18n"

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

    const { store } = useRealm()
    const devices = store.objects<Device>(Device.getName())
    const account = devices[0].accounts[0]

    const snapPoints = useMemo(() => ["50%"], [])

    const handleSheetChanges = useCallback((index: number) => {
        console.log("accountManagementSheet position changed", index)
    }, [])

    const onAddAccount = useCallback(() => {
        onClose()
        openAddAccountSheet()
    }, [onClose, openAddAccountSheet])

    const onCopyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(account.address)
        Alert.alert(
            LL.COMMON_LBL_SUCCESS(),
            LL.NOTIFICATION_COPIED_CLIPBOARD({ name: LL.COMMON_LBL_ADDRESS() }),
        )
    }, [account, LL])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                w={100}>
                <BaseText typographyFont="subTitle">
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
            <BaseTouchableBox action={onCopyToClipboard}>
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
