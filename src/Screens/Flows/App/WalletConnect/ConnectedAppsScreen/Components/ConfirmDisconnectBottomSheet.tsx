import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { SessionTypes } from "@walletconnect/types"
import React from "react"
import {
    BaseButton,
    BaseView,
    BaseText,
    BaseSpacer,
    BaseBottomSheet,
} from "~Components"
import { AccountWithDevice } from "~Model"
import { WalletConnectUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { ConnectedAppBox } from "./ConnectedAppBox"

const snapPoints = ["50%", "70%"]

type Props = {
    onConfirm: (topic: string) => void
    onCancel: () => void
    session: SessionTypes.Struct
    account: AccountWithDevice
}

export const ConfirmDisconnectBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onConfirm, onCancel, session, account }, ref) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    if (!session) return null

    const { name } = WalletConnectUtils.getSessionRequestAttributes(session)

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref} onDismiss={onCancel}>
            <BaseView>
                <BaseText typographyFont="subTitleBold">
                    {LL.SB_CONFIRM_OPERATION()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseText typographyFont="body">
                    {LL.CONNECTED_APPS_CONFIRM_DISCONNECT_MESSAGE({
                        name,
                        alias: account.alias,
                    })}
                </BaseText>

                <BaseSpacer height={24} />
                <ConnectedAppBox session={session} account={account} />

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
