import { useCallback, useState } from "react"
import { useBottomSheetModal } from "../useBottomSheet"
import { useAppDispatch, addContact } from "~Storage/Redux"

export const useTransferAddContact = () => {
    const dispatch = useAppDispatch()

    const [selectedContactAddress, setSelectedContactAddress] =
        useState<string>()

    const {
        ref: addContactSheet,
        onOpen: openAddContactSheet,
        onClose: closeAddContactSheet,
    } = useBottomSheetModal()

    const onAddContactPress = useCallback(
        (address: string) => {
            setSelectedContactAddress(address)

            openAddContactSheet()
        },
        [openAddContactSheet],
    )
    const handleSaveContact = useCallback(
        (_alias: string, _address: string) => {
            if (selectedContactAddress) {
                dispatch(addContact(_alias, _address))
                closeAddContactSheet()
            }
        },
        [closeAddContactSheet, dispatch, selectedContactAddress],
    )
    return {
        onAddContactPress,
        handleSaveContact,
        addContactSheet,
        selectedContactAddress,
        closeAddContactSheet,
    }
}
