import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ConnectedApp } from "~Screens"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { ConnectedAppBox } from "./ConnectedAppBox"

type Props = {
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmDisconnectBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onConfirm, onCancel }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        const confirm = () => {
            onConfirm()
            onCancel()
        }

        return (
            <BaseBottomSheet<ConnectedApp>
                dynamicHeight
                ref={ref}
                onDismiss={onCancel}
                title={LL.CONNECTED_APP_DELETE_TITLE()}>
                {connectedApp => (
                    <>
                        <BaseSpacer height={8} />
                        <BaseText
                            typographyFont="bodyMedium"
                            color={theme.isDark ? COLORS.GREY_400 : COLORS.GREY_500}
                            testID="CONFIRM_DISCONNECT_APP_DESCRIPTION">
                            {LL.CONNECTED_APP_DELETE_DESCRIPTION()}
                        </BaseText>

                        <BaseSpacer height={12} />
                        <ConnectedAppBox connectedApp={connectedApp} />

                        <BaseSpacer height={24} />
                        <BaseView flexDirection="row" gap={16} mb={isIOS() ? 16 : 0}>
                            <BaseButton variant="outline" action={onCancel} title={LL.COMMON_BTN_CANCEL()} flex={1} />
                            <BaseButton
                                action={confirm}
                                title={LL.COMMON_BTN_CONFIRM()}
                                flex={1}
                                testID="CONFIRM_DISCONNECT_APP_APPLY"
                            />
                        </BaseView>
                    </>
                )}
            </BaseBottomSheet>
        )
    },
)
