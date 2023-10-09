import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useState } from "react"
import {
    AccountCard,
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    ScrollViewWithFooter,
} from "~Components"
import { AccountWithDevice } from "~Model"
import { useI18nContext } from "~i18n"
import { AppInfo } from "../../Components"
import { WalletConnectSession } from "~Storage/Redux"

const snapPoints = ["65%"]

type Props = {
    onClose: () => void
    session: WalletConnectSession
    account: AccountWithDevice
    onDisconnect: () => void
}

export const AppDetailsBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, session, account, onDisconnect }, ref) => {
    const [isScrollEnabled, setIsScrollEnabled] = useState(true)

    const { LL } = useI18nContext()

    const { name, description, url, icons } = session.dAppMetadata

    const disconnectSession = useCallback(() => {
        onClose()
        onDisconnect()
    }, [onDisconnect, onClose])

    const hanldeOnReadMore = useCallback((isDescriptionExpanded: boolean) => {
        setIsScrollEnabled(isDescriptionExpanded)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onDismiss={onClose}
            title={LL.CONNECTED_APP_TITLE()}>
            <ScrollViewWithFooter
                isScrollEnabled={isScrollEnabled}
                footer={
                    <BaseButton action={disconnectSession} title="Disconnect" />
                }>
                <BaseView mx={10}>
                    <BaseSpacer height={16} />
                    <AppInfo
                        name={name}
                        url={url}
                        icon={icons[0] ?? ""}
                        description={description}
                        hanldeOnReadMore={hanldeOnReadMore}
                    />

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subSubTitle">
                        {LL.CONNECTED_APP_DETAILS_ACCOUNT_LABEL()}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <AccountCard
                        account={account}
                        showOpacityWhenDisabled={false}
                    />

                    <BaseSpacer height={40} />
                </BaseView>
            </ScrollViewWithFooter>
        </BaseBottomSheet>
    )
})
