import React, { useEffect, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { ContactForm } from "../../AddContactScreen/Components"
import { useContactValidation } from "./Hooks"
import { useTheme } from "~Common"
import { Contact } from "~Model"

type Props = {
    contact?: Contact
    onClose: () => void
    onEditContact: (alias: string, address: string) => void
}

const snapPoints = ["70%"]

export const EditContactBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ contact, onEditContact }, ref) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    const [alias, setAlias] = useState<string>(contact?.alias || "")
    const [address, setAddress] = useState<string>(contact?.address || "")

    useEffect(() => {
        setAlias(contact?.alias || "")
        setAddress(contact?.address || "")
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
        return addressError.length === 0
    }, [addressError.length])

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
                            titleName={LL.BD_CONTACT_NAME()}
                            titleAddress={LL.BD_CONTACT_ADDRESS()}
                            nameError={nameError}
                            addressError={addressError}
                            setName={setAlias}
                            setAddress={setAddress}
                            valueName={alias}
                            valueAddress={address}
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
                                <BaseText>{LL.BTN_PASTE_ADDRESS()}</BaseText>
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
                            action={() => onEditContact(alias, address)}
                            w={100}
                            disabled={!isFormValid}
                            title={LL.COMMON_BTN_SAVE().toUpperCase()}
                            bgColor={theme.colors.primary}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
