import React, { useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    ScrollViewWithFooter,
} from "~Components"
import { useI18nContext } from "~i18n"
import { insertContact, useAppDispatch } from "~Storage/Redux"
import { ContactType } from "~Model"

type Props = {
    handleClose: () => void
    goToResumeStep: () => void
    address: string
}

export const CreateContactBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ goToResumeStep, address, handleClose }, ref) => {
    const { LL } = useI18nContext()
    const [creationMode, setCreationMode] = useState(false)
    const [name, setName] = useState("")
    const dispatch = useAppDispatch()
    const snapPoints = creationMode ? ["60%"] : ["40%"]

    const closeAndGotoResumeStep = () => {
        setName("")
        setCreationMode(false)
        handleClose()
        goToResumeStep()
    }

    const handleSaveButton = () => {
        dispatch(
            insertContact({
                alias: name,
                address,
                type: ContactType.KNOWN,
            }),
        )
        closeAndGotoResumeStep()
    }

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            {creationMode ? (
                <ScrollViewWithFooter
                    footer={
                        <BaseView>
                            <BaseButton
                                w={100}
                                title={LL.COMMON_BTN_SAVE()}
                                action={handleSaveButton}
                            />
                            <BaseSpacer height={16} />
                            <BaseButton
                                w={100}
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
                        <BaseTextInput value={name} setValue={setName} />
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="button">
                            {LL.SEND_CREATE_CONTACT_ADDRESS()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseTextInput disabled value={address} />
                    </BaseView>
                </ScrollViewWithFooter>
            ) : (
                <ScrollViewWithFooter
                    footer={
                        <BaseView>
                            <BaseButton
                                w={100}
                                title={LL.SEND_CREATE_CONTACT_CREATE_BUTTON()}
                                action={() => setCreationMode(true)}
                            />
                            <BaseSpacer height={16} />
                            <BaseButton
                                w={100}
                                variant="outline"
                                title={LL.SEND_CREATE_CONTACT_PROCEED_ANYWAY_BUTTON()}
                                action={closeAndGotoResumeStep}
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
