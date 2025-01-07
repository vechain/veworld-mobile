import React from "react"
import { BaseSafeArea, Layout, PlusIconHeaderButton } from "~Components"
import { ManageUrls } from "./Components/ManageUrls/ManageUrls"
import { AddUrlBottomSheet } from "./Components/AddUrlBottomSheet"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"

export const ManageUrlsScreen = () => {
    const {
        ref: refSelectDelegationUrlBottomSheet,
        onOpen: openSelectDelegationUrlBottomSheet,
        onClose: closeSelectDelegationUrlBottonSheet,
    } = useBottomSheetModal()
    const { LL } = useI18nContext()

    return (
        <Layout
            title={LL.SEND_DELEGATION_MANAGE_URL()}
            headerRightElement={
                <PlusIconHeaderButton action={openSelectDelegationUrlBottomSheet} testID="add-delegation-url" />
            }
            body={
                <BaseSafeArea grow={1}>
                    <ManageUrls />
                    <AddUrlBottomSheet
                        ref={refSelectDelegationUrlBottomSheet}
                        handleClose={closeSelectDelegationUrlBottonSheet}
                    />
                </BaseSafeArea>
            }
        />
    )
}
