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
import { useRenameAccount } from "~Hooks"
import {
    selectBalanceVisible,
    selectVetBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { COLORS, VET } from "~Constants"
import { FormattingUtils } from "~Utils"
import { StyleSheet } from "react-native"
import { Account } from "~Model"

type Props = {
    onClose: () => void
    account: Account
}

const snapPoints = ["40%"]

export const RenameAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, account }, ref) => {
    const { LL } = useI18nContext()

    const { changeAccountAlias } = useRenameAccount(account)

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const vetBalance = useAppSelector(state =>
        selectVetBalanceByAccount(state, account.address),
    )

    const RenderBalance = useMemo(() => {
        return isBalanceVisible
            ? `${vetBalance} ${VET.symbol}`
            : `***** ${VET.symbol}`
    }, [isBalanceVisible, vetBalance])

    const [text, setText] = useState(account.alias)

    const RenderTitle = useMemo(
        () =>
            LL.TITLE_RENAME({
                type: text,
            }),

        [LL, text],
    )

    const RenderAccountAddress = useMemo(() => {
        return FormattingUtils.humanAddress(account.address, 3, 4)
    }, [account.address])

    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === 0) setText(account.alias)
            else setText("")
        },
        [account.alias],
    )

    const onRenameAccount = useCallback(() => {
        changeAccountAlias({ newAlias: text })
        onClose()
    }, [changeAccountAlias, text, onClose])

    const handleOnChangeText = useCallback((_text: string) => {
        const newText = FormattingUtils.limitChars(_text)
        setText(newText)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ignoreMinimumSnapPoint
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
