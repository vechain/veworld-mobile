import React from "react"
import { URLUtils } from "~Utils"
import {
    BaseBottomSheetTextInput,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    ScrollViewWithFooter,
} from "~Components"
import {
    addDelegationUrl,
    selectDelegationUrls,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"

/**
 * BottomSheet content to add a new delegation url
 * @param newUrl {string} value of the new url
 * @param setNewUrl {function} function to set the new url
 * @param setSelectedDelegationUrl {function} function to set the url for the current transaction
 * @param addUrlMode {function} bottomsheet mode
 * @param setAddUrlMode {function} function to set bottomsheet mode
 */
type Props = {
    setSelectedDelegationUrl: (url: string) => void
    newUrl: string
    setNewUrl: (url: string) => void
    addUrlMode: boolean
    setAddUrlMode: (s: boolean) => void
    onCloseBottomSheet: () => void
}

export const AddUrl = ({
    newUrl,
    setNewUrl,
    setSelectedDelegationUrl,
    addUrlMode,
    setAddUrlMode,
    onCloseBottomSheet,
}: Props) => {
    const dispatch = useAppDispatch()
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const { LL } = useI18nContext()
    const handleAddUrl = () => {
        if (!delegationUrls.includes(newUrl)) {
            dispatch(addDelegationUrl(newUrl))
        }
        setSelectedDelegationUrl(newUrl)
        onCloseBottomSheet()
    }
    const closeAddMode = () => {
        setAddUrlMode(false)
    }
    return (
        <ScrollViewWithFooter
            footer={
                <BaseView flexDirection="row">
                    {addUrlMode && (
                        <>
                            <BaseButton
                                title={LL.COMMON_BTN_CANCEL()}
                                action={closeAddMode}
                                variant="outline"
                                flex={1}
                            />
                            <BaseSpacer width={16} />
                        </>
                    )}
                    <BaseButton
                        title={LL.COMMON_BTN_ADD()}
                        action={handleAddUrl}
                        disabled={!URLUtils.isValid(newUrl)}
                        flex={1}
                    />
                </BaseView>
            }>
            <BaseText typographyFont="subTitleBold">
                {LL.SEND_DELEGATION_ADD_URL()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="subSubTitleLight">
                {LL.SEND_DELEGATION_ADD_URL_SUBTITLE()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseBottomSheetTextInput
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder={LL.SEND_DELEGATION_ADD_URL_PLACEHOLDER()}
                testID="AddUrl_input"
            />
        </ScrollViewWithFooter>
    )
}
