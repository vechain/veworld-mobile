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
import { Account } from "~Storage"
import { Alert } from "react-native"

type Props = {
    account: Account
    onClose: () => void
    openAddAccountSheet: () => void
}

const AccountManagementBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ account, onClose, openAddAccountSheet }, ref) => {
    const theme = useTheme()

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
        Alert.alert("Success!", "Mnemonic copied to clipboard")
    }, [account])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView
                orientation="row"
                justify="space-between"
                w={100}
                align="center">
                <BaseText typographyFont="subTitle">
                    Account management
                </BaseText>

                <BaseIcon
                    name={"add-sharp"}
                    size={32}
                    bg={theme.colors.secondary}
                    action={onAddAccount}
                />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseTouchableBox action={onCopyToClipboard}>
                <BaseIcon
                    name={"copy-outline"}
                    size={18}
                    color={theme.colors.text}
                    action={onAddAccount}
                />
                <BaseText mx={8}>Copy Public address</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}} disabled>
                <BaseIcon
                    name={"qr-outline"}
                    size={18}
                    color={theme.colors.text}
                />
                <BaseText mx={8}>Show QR code</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}} disabled>
                <BaseIcon
                    name={"pencil-outline"}
                    size={18}
                    color={theme.colors.text}
                />
                <BaseText mx={8}>Rename account</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}} disabled>
                <BaseIcon
                    name={"trash-outline"}
                    size={18}
                    color={theme.colors.text}
                />
                <BaseText mx={8}>Remove account</BaseText>
            </BaseTouchableBox>
        </BaseBottomSheet>
    )
})

export default AccountManagementBottomSheet
