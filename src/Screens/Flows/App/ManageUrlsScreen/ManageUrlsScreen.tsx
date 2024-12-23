import React from "react"
import { BaseSafeArea, Layout } from "~Components"
import { ManageUrls } from "./Components/ManageUrls/ManageUrls"
import { AddUrlBottomSheet } from "./Components/AddUrlBottomSheet"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PlusHeaderIcon } from "~Components/Reusable/HeaderRightIcons"

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
                <PlusHeaderIcon action={openSelectDelegationUrlBottomSheet} testID="add-delegation-url" />
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
