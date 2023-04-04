import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet } from "~Components"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AddressUtils, FormUtils, useTheme } from "~Common"
import { ContactForm } from "../../AddContactScreen/Components"
import { address as thorAddress } from "thor-devkit"
import { Contact } from "~Model"

const MAX_INPUT_LENGTH = 19

type Props = {
    currentContactName: string
    currentContactAddress: string
    contacts: Contact[]
    onClose: () => void
    onEditContact: (alias: string, address: string) => void
}

const snapPoints = ["70%"]

export const ContactEditBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        { currentContactName, currentContactAddress, contacts, onEditContact },
        ref,
    ) => {
        // [Start] Hooks
        const { LL } = useI18nContext()

        const theme = useTheme()

        // Contact form states
        const [name, setName] = useState<string>(currentContactName)
        const [address, setAddress] = useState<string>(currentContactAddress)
        const [isValidForm, setIsValidForm] = useState<boolean>(false)

        useEffect(() => {
            setName(currentContactName)
            setAddress(currentContactAddress)
        }, [currentContactName, currentContactAddress])

        // [End] Hooks

        // [Start] Methods

        const validateName = useCallback(
            (contactName: string) => {
                if (contactName.length === 0) {
                    return LL.ERROR_REQUIRED_FIELD()
                }
                if (contactName.length > MAX_INPUT_LENGTH) {
                    return LL.ERROR_MAX_INPUT_LENGTH()
                }
                if (FormUtils.alreadyExists(contactName, contacts, "alias")) {
                    return LL.ERROR_NAME_ALREADY_EXISTS()
                }
                return ""
            },
            [LL, contacts],
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
                    )
                ) {
                    return LL.ERROR_ADDRESS_EXISTS()
                }
                return ""
            },
            [LL, contacts],
        )

        // [End] Methods

        return (
            <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
                <BaseView flexGrow={1}>
                    <BaseView
                        alignItems="center"
                        justifyContent="space-between"
                        flexGrow={1}>
                        <BaseView alignSelf="flex-start">
                            <BaseView
                                flexDirection="row"
                                justifyContent="space-between"
                                w={100}
                                alignItems="center">
                                <BaseText typographyFont="subTitleBold">
                                    {LL.SB_EDIT_CONTACT()}
                                </BaseText>
                            </BaseView>

                            <BaseSpacer height={16} />

                            <ContactForm
                                placeholderName={currentContactName}
                                placeholderAddress={currentContactAddress}
                                titleName={LL.BD_CONTACT_NAME()}
                                titleAddress={LL.BD_CONTACT_ADDRESS()}
                                name={name}
                                address={address}
                                setName={setName}
                                setAddress={setAddress}
                                setIsValidForm={setIsValidForm}
                                validateName={validateName}
                                validateAddress={validateAddress}
                            />

                            <BaseSpacer height={16} />

                            <BaseView flexDirection="row">
                                <BaseTouchableBox
                                    action={() => {}} // TODO: add action
                                    w="auto"
                                    flex={1}
                                    justifyContent="space-between">
                                    <BaseIcon
                                        name="clipboard-outline"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                    <BaseText>
                                        {LL.BTN_PASTE_ADDRESS()}
                                    </BaseText>
                                </BaseTouchableBox>
                                <BaseSpacer width={16} />
                                <BaseTouchableBox
                                    action={() => {}} // TODO: add action
                                    w="auto"
                                    flex={1}
                                    justifyContent="space-between">
                                    <BaseIcon
                                        name="flip-horizontal"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                    <BaseText>{LL.BTN_SCAN_QR_CODE()}</BaseText>
                                </BaseTouchableBox>
                            </BaseView>
                        </BaseView>

                        <BaseSpacer height={28} />

                        <BaseView flexDirection="row" mb={20}>
                            <BaseButton
                                action={() => onEditContact(name, address)}
                                w={100}
                                disabled={!isValidForm}
                                title={LL.COMMON_BTN_SAVE().toUpperCase()}
                                bgColor={theme.colors.primary}
                            />
                        </BaseView>
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
