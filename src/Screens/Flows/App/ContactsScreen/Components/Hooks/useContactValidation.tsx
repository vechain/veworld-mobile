import { useCallback } from "react"
import { AddressUtils, FormUtils } from "~Utils"
import { selectContacts, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { address as thorAddress } from "thor-devkit"
import { Contact } from "~Model"

const MAX_INPUT_LENGTH = 19

export const useContactValidation = (
    checkNameExists?: boolean,
    exclude?: Contact,
) => {
    const { LL } = useI18nContext()

    const contacts = useAppSelector(selectContacts)

    const validateName = useCallback(
        (contactName: string) => {
            if (contactName.length === 0) {
                return LL.ERROR_REQUIRED_FIELD()
            }
            if (contactName.length > MAX_INPUT_LENGTH) {
                return LL.ERROR_MAX_INPUT_LENGTH()
            }
            if (
                checkNameExists &&
                FormUtils.alreadyExists(contactName, contacts, "alias", exclude)
            ) {
                return LL.ERROR_NAME_ALREADY_EXISTS()
            }
            return ""
        },
        [LL, checkNameExists, contacts, exclude],
    )

    const validateAddress = useCallback(
        (contactAddress: string) => {
            if (contactAddress.length === 0) {
                return LL.ERROR_REQUIRED_FIELD()
            }
            if (!AddressUtils.isValid(contactAddress)) {
                return LL.ERROR_ADDRESS_INVALID()
            }
            if (
                FormUtils.alreadyExists(
                    thorAddress.toChecksumed(contactAddress),
                    contacts,
                    "address",
                    exclude,
                )
            ) {
                return LL.ERROR_ADDRESS_EXISTS()
            }
            return ""
        },
        [LL, contacts, exclude],
    )

    return { validateName, validateAddress }
}
