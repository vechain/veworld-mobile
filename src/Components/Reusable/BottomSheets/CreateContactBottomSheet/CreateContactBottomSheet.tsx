import React, { RefObject, useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheetTextInput,
    BaseIcon,
} from "~Components"
import { useI18nContext } from "~i18n"
import { createContact, insertContact, useAppDispatch } from "~Storage/Redux"
import { Contact, ContactType } from "~Model"
import { useContactValidation } from "~Screens/Flows/App/ContactsScreen"
import { Keyboard } from "react-native"
import { useTheme } from "~Hooks/useTheme"
import { useBottomSheetModal } from "~Hooks"

type Props = {
    address: string
    onClose: () => void
}

const CreateContactBottomSheetContent = ({ address: _address, onClose }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const [address, setAddress] = useState<string>(_address)
    const [alias, setAlias] = useState<string>("")

    const contact: Contact = useMemo(() => {
        return createContact(alias, address, ContactType.KNOWN)
    }, [alias, address])

    const { validateName, validateAddress } = useContactValidation(false, contact)

    const { nameError, addressError } = {
        nameError: validateName(alias),
        addressError: validateAddress(address),
    }

    const isFormValid = useMemo(() => {
        return addressError.length === 0 && nameError.length === 0
    }, [addressError.length, nameError.length])

    const dispatch = useAppDispatch()

    const handleSaveButton = useCallback(() => {
        if (!isFormValid) return
        dispatch(insertContact(contact))
        Keyboard.dismiss()

        // this is a workaround to wait for keyboard to be dismissed before closing the bottom sheet, otherwise it won't close
        setTimeout(() => {
            onClose()
        }, 200)
    }, [isFormValid, dispatch, contact, onClose])

    return (
        <>
            <BaseView gap={24}>
                <BaseView gap={8}>
                    <BaseView flexDirection="row" gap={12}>
                        <BaseIcon name="icon-users" size={24} color={theme.colors.text} />
                        <BaseText typographyFont="subTitleSemiBold">{LL.SEND_CREATE_CONTACT_TITLE()}</BaseText>
                    </BaseView>
                    <BaseText typographyFont="bodyMedium">{LL.SEND_CREATE_CONTACT_DESCRIPTION()}</BaseText>
                </BaseView>

                <BaseBottomSheetTextInput
                    label={LL.SEND_CREATE_CONTACT_ADDRESS()}
                    placeholder={LL.SEND_CREATE_CONTACT_ADDRESS_PLACEHOLDER()}
                    value={_address}
                    setValue={setAddress}
                />

                <BaseBottomSheetTextInput
                    label={LL.SEND_CREATE_CONTACT_NAME()}
                    placeholder={LL.SEND_CREATE_CONTACT_NAME_PLACEHOLDER()}
                    value={alias}
                    setValue={setAlias}
                />

                <BaseView flexDirection="row" justifyContent="space-between" gap={16}>
                    <BaseButton
                        flex={1}
                        w={100}
                        haptics="Light"
                        variant="outline"
                        title={LL.COMMON_BTN_CANCEL()}
                        action={onClose}
                    />
                    <BaseButton
                        flex={1}
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_SAVE()}
                        action={handleSaveButton}
                        disabled={!isFormValid}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={16} />
        </>
    )
}

export const CreateContactBottomSheet = ({ bsRef }: { bsRef: RefObject<BottomSheetModalMethods> }) => {
    const { ref: bottomSheetRef, onClose } = useBottomSheetModal({ externalRef: bsRef })

    return (
        <BaseBottomSheet<{ address: string }> dynamicHeight ref={bottomSheetRef}>
            {({ address }) => <CreateContactBottomSheetContent address={address} onClose={onClose} />}
        </BaseBottomSheet>
    )
}
