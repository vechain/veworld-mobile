import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { AccountWithDevice } from "~Model"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { ConnectedAppBox } from "./ConnectedAppBox"
import { WalletConnectSession } from "~Storage/Redux"

const snapPoints = ["50%", "70%"]

type Props = {
    onConfirm: (topic: string) => void
    onCancel: () => void
    session: WalletConnectSession
    account: AccountWithDevice
}

export const ConfirmDisconnectBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onConfirm, onCancel, session, account }, ref) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    if (!session) return null

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref} onDismiss={onCancel}>
            <BaseView>
                <BaseText typographyFont="subTitleBold">
                    {LL.SB_CONFIRM_OPERATION()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseText typographyFont="body">
                    {LL.CONNECTED_APPS_CONFIRM_DISCONNECT_MESSAGE({
                        name: session.dAppMetadata.name,
                        alias: account.alias,
                    })}
                </BaseText>

                <BaseSpacer height={24} />
                <ConnectedAppBox session={session} />

                <BaseSpacer height={48} />
                <BaseButton
                    w={100}
                    px={20}
                    action={() => onConfirm(session.topic)}
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
            </BaseView>
        </BaseBottomSheet>
    )
})
