import React from "react"
import { URLUtils } from "~Common"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseTextInput,
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

interface Props {
    setSelectedDelegationUrl: (url: string) => void
    newUrl: string
    setNewUrl: (url: string) => void
}
/**
 * BottomSheet content to add a new delegation url
 * @param newUrl {string} value of the new url
 * @param setNewUrl {function} function to set the new url
 * @param setSelectedDelegationUrl {function} function to set the url for the current transaction
 */
export const AddUrl = ({
    newUrl,
    setNewUrl,
    setSelectedDelegationUrl,
}: Props) => {
    const dispatch = useAppDispatch()
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const { LL } = useI18nContext()
    const handleAddUrl = () => {
        if (!delegationUrls.includes(newUrl)) {
            dispatch(addDelegationUrl(newUrl))
        }
        setSelectedDelegationUrl(newUrl)
    }
    return (
        <ScrollViewWithFooter
            footer={
                <BaseView flexDirection="row">
                    <BaseButton
                        title={LL.COMMON_BTN_ADD()}
                        action={handleAddUrl}
                        disabled={!URLUtils.isValid(newUrl)}
                    />
                    <BaseButton
                        title={LL.COMMON_BTN_ADD()}
                        action={handleAddUrl}
                        disabled={!URLUtils.isValid(newUrl)}
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
            <BaseTextInput
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder={LL.SEND_DELEGATION_ADD_URL_PLACEHOLDER()}
            />
        </ScrollViewWithFooter>
    )
}
