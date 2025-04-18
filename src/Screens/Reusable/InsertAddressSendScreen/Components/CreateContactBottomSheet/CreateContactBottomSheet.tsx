import React, { useCallback, useMemo, useRef, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView, BaseBottomSheetTextInput } from "~Components"
import { useI18nContext } from "~i18n"
import { createContact, insertContact, useAppDispatch } from "~Storage/Redux"
import { Contact, ContactType } from "~Model"
import { useContactValidation } from "~Screens/Flows/App/ContactsScreen"
import { Keyboard } from "react-native"

type Props = {
    onClose: () => void
    onSubmit: (address: string) => void
    address: string
}

export const CreateContactBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onSubmit, address, onClose }, ref) => {
        const { LL } = useI18nContext()
        const [creationMode, setCreationMode] = useState(false)
        const [alias, setAlias] = useState<string>("")
        const shouldInvokeOnSubmit = useRef(false)

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

        const backToChooseMode = useCallback(() => {
            setAlias("")
            setCreationMode(false)
        }, [])

        const handleSaveButton = useCallback(() => {
            if (!isFormValid) return
            dispatch(insertContact(contact))
            Keyboard.dismiss()

            // this is a workaround to wait for keyboard to be dismissed before closing the bottom sheet, otherwise it won't close
            setTimeout(() => {
                onClose()
                onSubmit(contact.address)
                backToChooseMode()
            }, 200)
        }, [isFormValid, dispatch, contact, onClose, onSubmit, backToChooseMode])

        const handleProceedAnywayButton = useCallback(() => {
            shouldInvokeOnSubmit.current = true
            onClose()
        }, [onClose])

        const onDismiss = useCallback(() => {
            if (shouldInvokeOnSubmit.current) {
                onSubmit(address)
                shouldInvokeOnSubmit.current = false
            }
        }, [address, onSubmit])

        return (
            <BaseBottomSheet ref={ref} dynamicHeight onDismiss={onDismiss}>
                {creationMode ? (
                    <BaseView>
                        <BaseView alignItems="stretch" w={100}>
                            <BaseText typographyFont="subTitleBold">{LL.SEND_CREATE_CONTACT_TITLE()}</BaseText>
                            <BaseSpacer height={16} />
                            <BaseText typographyFont="button">{LL.SEND_CREATE_CONTACT_NAME()}</BaseText>
                            <BaseSpacer height={16} />
                            <BaseBottomSheetTextInput
                                value={alias}
                                setValue={setAlias}
                                placeholder={LL.SEND_CREATE_CONTACT_NAME()}
                            />
                            <BaseSpacer height={24} />
                            <BaseText typographyFont="button">{LL.SEND_CREATE_CONTACT_ADDRESS()}</BaseText>
                            <BaseSpacer height={16} />
                            <BaseBottomSheetTextInput disabled value={address} />
                        </BaseView>

                        <BaseView>
                            <BaseSpacer height={24} />
                            <BaseButton
                                w={100}
                                haptics="Light"
                                title={LL.COMMON_BTN_SAVE()}
                                action={handleSaveButton}
                                disabled={!isFormValid}
                            />
                            <BaseSpacer height={16} />
                            <BaseButton
                                w={100}
                                haptics="Light"
                                variant="outline"
                                title={LL.COMMON_BTN_CANCEL()}
                                action={backToChooseMode}
                            />
                        </BaseView>
                    </BaseView>
                ) : (
                    <BaseView justifyContent="space-between" flexGrow={1}>
                        <BaseView>
                            <BaseText typographyFont="subTitleBold">{LL.SEND_CREATE_CONTACT_TITLE()}</BaseText>
                            <BaseSpacer height={16} />
                            <BaseText typographyFont="subSubTitleLight">{LL.SEND_CREATE_CONTACT_SUBTITLE()}</BaseText>
                        </BaseView>

                        <BaseSpacer height={16} />

                        <BaseView>
                            <BaseButton
                                w={100}
                                haptics="Light"
                                title={LL.SEND_CREATE_CONTACT_CREATE_BUTTON()}
                                action={() => setCreationMode(true)}
                            />
                            <BaseSpacer height={16} />
                            <BaseButton
                                w={100}
                                haptics="Light"
                                variant="outline"
                                title={LL.SEND_CREATE_CONTACT_PROCEED_ANYWAY_BUTTON()}
                                action={handleProceedAnywayButton}
                            />
                        </BaseView>
                    </BaseView>
                )}
                <BaseSpacer height={16} />
            </BaseBottomSheet>
        )
    },
)
