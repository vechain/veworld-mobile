import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    ScrollViewWithFooter,
    BaseBottomSheetTextInput,
} from "~Components"
import { useI18nContext } from "~i18n"
import { insertContact, useAppDispatch } from "~Storage/Redux"
import { Contact, ContactType } from "~Model"
import { useContactValidation } from "~Screens/Flows/App/ContactsScreen"

type Props = {
    onClose: () => void
    onSubmit: (address: string) => void
    address: string
}

export const CreateContactBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onSubmit, address, onClose }, ref) => {
    const { LL } = useI18nContext()
    const [creationMode, setCreationMode] = useState(false)
    const [alias, setAlias] = useState<string>("")

    const contact: Contact = useMemo(() => {
        return {
            alias,
            address,
            type: ContactType.KNOWN,
        }
    }, [alias, address])

    const { validateName, validateAddress } = useContactValidation(
        false,
        contact,
    )

    const { nameError, addressError } = {
        nameError: validateName(alias),
        addressError: validateAddress(address),
    }

    const isFormValid = useMemo(() => {
        return addressError.length === 0 && nameError.length === 0
    }, [addressError.length, nameError.length])

    const dispatch = useAppDispatch()
    const snapPoints = creationMode ? ["60%"] : ["40%"]

    const closeAndSubmit = useCallback(() => {
        setAlias("")
        setCreationMode(false)
        onClose()
        onSubmit(address)
    }, [onClose, onSubmit, address])

    const handleSaveButton = useCallback(() => {
        if (!isFormValid) return
        dispatch(insertContact(contact))
        closeAndSubmit()
    }, [isFormValid, dispatch, contact, closeAndSubmit])

    return (
        <BaseBottomSheet ref={ref} snapPoints={snapPoints}>
            {creationMode ? (
                <ScrollViewWithFooter
                    footer={
                        <BaseView>
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
                                action={() => setCreationMode(false)}
                            />
                        </BaseView>
                    }>
                    <BaseView alignItems="stretch" w={100}>
                        <BaseText typographyFont="subTitleBold">
                            {LL.SEND_CREATE_CONTACT_TITLE()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="button">
                            {LL.SEND_CREATE_CONTACT_NAME()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseBottomSheetTextInput
                            value={alias}
                            setValue={setAlias}
                            placeholder={LL.SEND_CREATE_CONTACT_NAME()}
                        />
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="button">
                            {LL.SEND_CREATE_CONTACT_ADDRESS()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseBottomSheetTextInput disabled value={address} />
                    </BaseView>
                </ScrollViewWithFooter>
            ) : (
                <ScrollViewWithFooter
                    footer={
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
                                action={closeAndSubmit}
                            />
                        </BaseView>
                    }>
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {LL.SEND_CREATE_CONTACT_TITLE()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleLight">
                            {LL.SEND_CREATE_CONTACT_SUBTITLE()}
                        </BaseText>
                    </BaseView>
                </ScrollViewWithFooter>
            )}
        </BaseBottomSheet>
    )
})
