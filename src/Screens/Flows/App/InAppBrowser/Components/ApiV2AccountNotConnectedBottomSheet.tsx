import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"

type Props = {
    onConfirm: () => void
    onCancel: () => void
}

export const ApiV2AccountNotConnectedBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onConfirm, onCancel }, ref) => {
        return (
            <BaseBottomSheet ref={ref} dynamicHeight>
                <BaseView>
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">{"Connect Account"}</BaseText>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleLight">
                            {"This account is not connected to the current dApp. do you want to connect it?"}
                        </BaseText>
                    </BaseView>

                    <BaseView>
                        <BaseSpacer height={16} />
                        <BaseButton w={100} haptics="Light" title={"Connect"} action={onConfirm} />
                        <BaseSpacer height={16} />
                        <BaseButton w={100} haptics="Light" variant="outline" title={"Cancel"} action={onCancel} />
                    </BaseView>
                    <BaseSpacer height={16} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
