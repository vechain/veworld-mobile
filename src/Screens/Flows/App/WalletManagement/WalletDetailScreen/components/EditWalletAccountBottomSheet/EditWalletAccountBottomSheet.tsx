import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseTextInput, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    type: "account" | "wallet"
    accountAlias?: string
    onConfirm: (name: string) => void
    onCancel: () => void
}

export const EditWalletAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ type, accountAlias, onConfirm, onCancel }, ref) => {
        const { LL } = useI18nContext()
        const [alias, setAlias] = useState(() => accountAlias)

        const onChangeText = useCallback((value: string) => {
            setAlias(value)
        }, [])

        useEffect(() => {
            setAlias(accountAlias)
        }, [accountAlias])

        return (
            <BaseBottomSheet ref={ref} dynamicHeight blurBackdrop>
                <BaseView>
                    <BaseView>
                        <BaseText typographyFont="subSubTitleBold">{`Edit ${type} name`}</BaseText>

                        <BaseSpacer height={8} />

                        <BaseTextInput testID="ChangeAlias_Input" value={alias} setValue={onChangeText} />

                        <BaseSpacer height={40} />

                        <BaseButton
                            testID="ConfirmChangeAlias_Btn"
                            w={100}
                            haptics="Light"
                            title={LL.COMMON_BTN_SAVE()}
                            action={() => onConfirm(alias ?? "")}
                        />
                        <BaseSpacer height={12} />
                        <BaseButton
                            testID="CancelChangeAlias_Btn"
                            w={100}
                            haptics="Light"
                            variant="outline"
                            title={LL.COMMON_BTN_CANCEL()}
                            action={onCancel}
                        />
                    </BaseView>
                    <BaseSpacer height={16} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
