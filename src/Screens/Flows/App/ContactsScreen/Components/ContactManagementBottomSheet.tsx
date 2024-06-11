import React, { useCallback, useEffect, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { ContactForm } from "../../AddContactScreen/Components"
import { useContactValidation } from "./Hooks"
import { useTheme } from "~Hooks"
import { Contact } from "~Model"
import { LocalizedString } from "typesafe-i18n"

type Props = {
    contact?: Contact
    isAddingContact?: boolean
    checkTouched?: boolean
    onClose: () => void
    onSaveContact: (alias: string, address: string) => void
}

export const ContactManagementBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ contact, isAddingContact = false, checkTouched = true, onSaveContact }, ref) => {
        const { LL } = useI18nContext()

        const theme = useTheme()

        const [alias, _setAlias] = useState<string>(contact?.alias ?? "")
        const [address, _setAddress] = useState<string>(contact?.address ?? "")
        const [nameError, setNameError] = useState<string | LocalizedString>("")
        const [addressError, setAddressError] = useState<string | LocalizedString>("")

        const { validateName, validateAddress } = useContactValidation(false, contact)

        const setAlias = useCallback(
            (_alias: string) => {
                setNameError(validateName(_alias))
                _setAlias(_alias)
            },
            [validateName],
        )

        const setAddress = useCallback(
            (_address: string) => {
                setAddressError(validateAddress(_address))
                _setAddress(_address)
            },
            [validateAddress],
        )

        useEffect(() => {
            _setAlias(contact?.alias ?? "")
            _setAddress(contact?.address ?? "")
        }, [contact, setAddress, setAlias])

        const isFormValid = useMemo(() => {
            return addressError.length === 0 && nameError.length === 0
        }, [addressError.length, nameError.length])

        const title = isAddingContact ? LL.BTN_CREATE_CONTACT() : LL.SB_EDIT_CONTACT()

        return (
            <BaseBottomSheet dynamicHeight ref={ref}>
                <BaseView w={100}>
                    <BaseView>
                        <BaseView flexDirection="row" justifyContent="space-between" w={100} alignItems="center">
                            <BaseText typographyFont="subTitleBold">{title}</BaseText>
                        </BaseView>

                        <BaseSpacer height={16} />

                        <ContactForm
                            titleName={LL.BD_CONTACT_NAME()}
                            titleAddress={LL.BD_CONTACT_ADDRESS()}
                            nameError={nameError}
                            addressError={addressError}
                            inBottomSheet={true}
                            setName={setAlias}
                            setAddress={setAddress}
                            valueName={alias}
                            valueAddress={address}
                            addressFieldDisabled={isAddingContact}
                            checkTouched={checkTouched}
                        />

                        <BaseSpacer height={16} />
                    </BaseView>

                    <BaseView flexDirection="row" pb={32}>
                        <BaseButton
                            haptics="Medium"
                            action={() => onSaveContact(alias, address)}
                            w={100}
                            disabled={!isFormValid}
                            title={LL.COMMON_BTN_SAVE().toUpperCase()}
                            bgColor={theme.colors.primary}
                        />
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
