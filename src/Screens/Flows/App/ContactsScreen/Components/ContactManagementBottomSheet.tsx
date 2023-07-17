import React, { useEffect, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { ContactForm } from "../../AddContactScreen/Components"
import { useContactValidation } from "./Hooks"
import { useTheme } from "~Hooks"
import { isSmallScreen } from "~Constants"
import { Contact } from "~Model"

type Props = {
    contact?: Contact
    isAddingContact?: boolean
    checkTouched?: boolean
    onClose: () => void
    onSaveContact: (alias: string, address: string) => void
}

const snapPoints = [isSmallScreen ? "60%" : "52%"]

export const ContactManagementBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            contact,
            isAddingContact = false,
            checkTouched = true,
            onSaveContact,
        },
        ref,
    ) => {
        const { LL } = useI18nContext()

        const theme = useTheme()

        const [alias, setAlias] = useState<string>(contact?.alias || "")
        const [address, setAddress] = useState<string>(contact?.address || "")

        useEffect(() => {
            setAlias(contact?.alias ?? "")
            setAddress(contact?.address ?? "")
        }, [contact])

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

        const title = isAddingContact
            ? LL.BTN_CREATE_CONTACT()
            : LL.SB_EDIT_CONTACT()

        return (
            <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
                <BaseView
                    w={100}
                    h={100}
                    flexGrow={1}
                    justifyContent="space-between">
                    <BaseView>
                        <BaseView
                            flexDirection="row"
                            justifyContent="space-between"
                            w={100}
                            alignItems="center">
                            <BaseText typographyFont="subTitleBold">
                                {title}
                            </BaseText>
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
