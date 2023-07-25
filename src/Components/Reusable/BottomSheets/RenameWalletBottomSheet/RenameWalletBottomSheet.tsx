import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseButton,
    BaseBottomSheet,
    BaseBottomSheetTextInput,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useRenameAccount, useRenameWallet } from "~Hooks"
import { RENAME_WALLET_TYPE } from "~Model"
import {
    selectBalanceVisible,
    selectVetBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { COLORS, VET } from "~Constants"
import { FormattingUtils } from "~Utils"
import { StyleSheet } from "react-native"

type Props = {
    type: string
    onClose: () => void
}

const snapPoints = ["34%"]

export const RenameWalletBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ type, onClose }, ref) => {
    const { LL } = useI18nContext()

    const { changeAccountAlias, selectedAccount } = useRenameAccount()
    const { changeDeviceAlias } = useRenameWallet()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const vetBalance = useAppSelector(state =>
        selectVetBalanceByAccount(state, selectedAccount.address),
    )

    const defaultStateValue = useMemo(
        () =>
            type === RENAME_WALLET_TYPE.ACCOUNT
                ? selectedAccount.alias
                : selectedAccount.device.alias,
        [selectedAccount.alias, selectedAccount.device.alias, type],
    )

    const RenderBalance = useMemo(() => {
        if (type === RENAME_WALLET_TYPE.DEVICE) return null
        return isBalanceVisible
            ? `${vetBalance} ${VET.symbol}`
            : `***** ${VET.symbol}`
    }, [isBalanceVisible, vetBalance, type])

    const [text, setText] = useState(defaultStateValue)

    const RenderTitle = useMemo(() => {
        if (type === RENAME_WALLET_TYPE.ACCOUNT) {
            return LL.TITLE_RENAME({
                type: text.length ? text : selectedAccount.alias,
            })
        }

        if (type === RENAME_WALLET_TYPE.DEVICE) {
            return LL.TITLE_RENAME({
                type: text.length ? text : selectedAccount.device.alias,
            })
        }
    }, [type, LL, text, selectedAccount.alias, selectedAccount.device.alias])

    const RenderAccountAddress = useMemo(() => {
        if (type === RENAME_WALLET_TYPE.DEVICE) return null

        return FormattingUtils.humanAddress(selectedAccount.address, 3, 4)
    }, [type, selectedAccount.address])

    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === 0) setText(defaultStateValue)
            else setText("")
        },
        [defaultStateValue],
    )

    const onRenameAccount = useCallback(() => {
        if (type === RENAME_WALLET_TYPE.ACCOUNT)
            changeAccountAlias({ newAlias: text })

        if (type === RENAME_WALLET_TYPE.DEVICE)
            changeDeviceAlias({ newAlias: text })

        onClose()
    }, [type, changeAccountAlias, text, changeDeviceAlias, onClose])

    const handleOnChangeText = useCallback((_text: string) => {
        const newText = FormattingUtils.limitChars(_text)
        setText(newText)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onChange={handleSheetChanges}>
            <BaseText typographyFont="subTitleBold">{RenderTitle}</BaseText>
            <BaseSpacer height={38} />

            <BaseView>
                <BaseView>
                    <BaseBottomSheetTextInput
                        value={text}
                        onChangeText={handleOnChangeText}
                        autoCapitalize="words"
                    />

                    <BaseView
                        alignItems="flex-end"
                        style={baseStyles.inputContainer}
                        pt={8}
                        pr={12}>
                        <BaseText
                            typographyFont="captionRegular"
                            pb={2}
                            color={COLORS.GRAY}>
                            {RenderAccountAddress}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">
                            {RenderBalance}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseButton
                    haptics="Medium"
                    disabled={!text.length}
                    action={onRenameAccount}
                    w={100}
                    title={LL.COMMON_BTN_SAVE().toUpperCase()}
                />
            </BaseView>

            <BaseSpacer height={18} />
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    inputContainer: {
        position: "absolute",
        right: 0,
    },
})
