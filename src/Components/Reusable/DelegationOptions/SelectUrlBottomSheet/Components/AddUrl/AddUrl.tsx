import React, { useMemo } from "react"
import { PlatformUtils, URIUtils } from "~Utils"
import {
    BaseBottomSheetTextInput,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    showWarningToast,
    useThor,
} from "~Components"
import { addDelegationUrl, useAppDispatch } from "~Storage/Redux"
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
    const { LL } = useI18nContext()
    const thor = useThor()
    const handleAddUrl = () => {
        dispatch(
            addDelegationUrl({
                url: newUrl,
                genesisId: thor.genesis.id,
                callbackIfAlreadyPresent: () => {
                    showWarningToast({
                        text1: LL.SEND_DELEGATION_ADD_URL_ALREADY_PRESENT(),
                    })
                },
            }),
        )
        setNewUrl("")
        setSelectedDelegationUrl(newUrl)
        onCloseBottomSheet()
    }
    const closeAddMode = () => {
        setAddUrlMode(false)
    }

    const platformPadding = useMemo(() => {
        if (PlatformUtils.isAndroid()) return 0

        return 32
    }, [])

    return (
        <BaseView w={100} h={100} flexGrow={1} justifyContent="space-between">
            <BaseView>
                <BaseText typographyFont="subTitleBold">{LL.SEND_DELEGATION_ADD_URL()}</BaseText>
                <BaseSpacer height={16} />
                <BaseText typographyFont="subSubTitleLight">{LL.SEND_DELEGATION_ADD_URL_SUBTITLE()}</BaseText>
                <BaseSpacer height={24} />
                <BaseBottomSheetTextInput
                    value={newUrl}
                    onChangeText={setNewUrl}
                    placeholder={LL.SEND_DELEGATION_ADD_URL_PLACEHOLDER()}
                    testID="AddUrl_input"
                />
            </BaseView>
            <BaseView flexDirection="row" pb={platformPadding}>
                {addUrlMode && (
                    <>
                        <BaseButton
                            testID="Add_URL_Cancel"
                            title={LL.COMMON_BTN_CANCEL()}
                            action={closeAddMode}
                            variant="outline"
                            flex={1}
                        />
                        <BaseSpacer width={16} />
                    </>
                )}
                <BaseButton
                    testID="Add_URL_Submit"
                    title={LL.COMMON_BTN_ADD()}
                    action={handleAddUrl}
                    disabled={!URIUtils.isValid(newUrl)}
                    flex={1}
                />
            </BaseView>
        </BaseView>
    )
}
