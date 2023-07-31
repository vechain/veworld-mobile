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
import { useRenameWallet } from "~Hooks"
import { Device } from "~Model"
import { FormattingUtils } from "~Utils"

type Props = {
    onClose: () => void
    device: Device
}

const snapPoints = ["40%"]

export const RenameWalletBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, device }, ref) => {
    const { LL } = useI18nContext()

    const { changeDeviceAlias } = useRenameWallet(device)

    const [text, setText] = useState(device.alias)

    const RenderTitle = useMemo(() => {
        return LL.TITLE_RENAME({
            type: text,
        })
    }, [LL, text])

    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === 0) setText(device.alias)
            else setText("")
        },
        [device.alias],
    )

    const onRenameWallet = useCallback(() => {
        changeDeviceAlias({ newAlias: text })
        onClose()
    }, [text, changeDeviceAlias, onClose])

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
                </BaseView>

                <BaseButton
                    haptics="Medium"
                    disabled={!text.length}
                    action={onRenameWallet}
                    w={100}
                    title={LL.COMMON_BTN_SAVE().toUpperCase()}
                />
            </BaseView>

            <BaseSpacer height={18} />
        </BaseBottomSheet>
    )
})
