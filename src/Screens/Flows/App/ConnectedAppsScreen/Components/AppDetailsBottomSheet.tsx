import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { SessionTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import {
    BaseButton,
    BaseView,
    BaseText,
    BaseSpacer,
    useWalletConnect,
    BaseBottomSheet,
    AccountIcon,
} from "~Components"
import { AccountWithDevice } from "~Model"
import { FormattingUtils, WalletConnectUtils } from "~Utils"
import { AppInfo } from "./AppInfo"
import { useI18nContext } from "~i18n"

const snapPoints = ["65%"]

type Props = {
    onClose: () => void
    session: SessionTypes.Struct
    account: AccountWithDevice
}

export const AppDetailsBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, session, account }, ref) => {
    const { disconnect } = useWalletConnect()
    const { LL } = useI18nContext()

    const { name, description, url, icon } =
        WalletConnectUtils.getSessionRequestAttributes(session)

    const disconnectSession = useCallback(() => {
        disconnect(session.topic)
        onClose()
    }, [session, disconnect, onClose])

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref} onDismiss={onClose}>
            <BaseView mx={20}>
                <BaseText typographyFont="title">
                    {LL.CONNECTED_APP_DETAILS_TITLE()}
                </BaseText>

                <BaseSpacer height={16} />
                <AppInfo
                    name={name}
                    url={url}
                    icon={icon}
                    description={description}
                />

                <BaseSpacer height={24} />
                <BaseText typographyFont="subSubTitle">
                    {LL.CONNECTED_APP_DETAILS_ACCOUNT_LABEL()}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseView flexDirection="row">
                    <AccountIcon address={account.address} />
                    <BaseSpacer width={8} />
                    <BaseView>
                        <BaseText typographyFont="subSubTitle">
                            {account.alias}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">
                            {FormattingUtils.humanAddress(account.address)}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
                <BaseButton action={disconnectSession} title="Disconnect" />
            </BaseView>
        </BaseBottomSheet>
    )
})
