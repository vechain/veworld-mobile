import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { ConnectedAppBox } from "./ConnectedAppBox"
import { ConnectedApp } from "~Screens"

type Props = {
    onConfirm: (topic: ConnectedApp) => void
    onCancel: () => void
    connectedApp: ConnectedApp
}

export const ConfirmDisconnectBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onConfirm, onCancel, connectedApp }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        const confirm = () => {
            onConfirm(connectedApp)
            onCancel()
        }

        return (
            <BaseBottomSheet dynamicHeight ref={ref} onDismiss={onCancel}>
                <BaseView>
                    <BaseText typographyFont="subTitleBold">{LL.SB_CONFIRM_OPERATION()}</BaseText>

                    <BaseSpacer height={24} />
                    <ConnectedAppBox connectedApp={connectedApp} />

                    <BaseSpacer height={48} />
                    <BaseButton
                        w={100}
                        px={20}
                        action={confirm}
                        title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                        bgColor={theme.colors.primary}
                    />
                    <BaseButton
                        w={100}
                        my={10}
                        variant="outline"
                        action={onCancel}
                        title={LL.COMMON_BTN_CANCEL().toUpperCase()}
                    />
                    <BaseSpacer height={16} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
