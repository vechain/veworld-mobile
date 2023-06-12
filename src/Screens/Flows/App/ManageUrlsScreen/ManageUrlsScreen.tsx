import React from "react"
import { BackButtonHeader, BaseSafeArea, BaseView } from "~Components"
import { ManageUrls } from "./Components/ManageUrls/ManageUrls"
import { AddUrlBottomSheet } from "./Components/AddUrlBottomSheet"
import { useBottomSheetModal } from "~Hooks"

export const ManageUrlsScreen = () => {
    const {
        ref: refSelectDelegationUrlBottomSheet,
        onOpen: openSelectDelegationUrlBottomSheet,
        onClose: closeSelectDelegationUrlBottonSheet,
    } = useBottomSheetModal()
    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView mx={20}>
                <ManageUrls openAddUrl={openSelectDelegationUrlBottomSheet} />
            </BaseView>
            <AddUrlBottomSheet
                ref={refSelectDelegationUrlBottomSheet}
                handleClose={closeSelectDelegationUrlBottonSheet}
            />
        </BaseSafeArea>
    )
}
