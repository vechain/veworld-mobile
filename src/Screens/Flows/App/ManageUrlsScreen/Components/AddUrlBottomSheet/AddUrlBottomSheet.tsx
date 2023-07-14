import React, { useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { URLUtils } from "~Utils"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    ScrollViewWithFooter,
    BaseBottomSheet,
} from "~Components"
import {
    addDelegationUrl,
    selectDelegationUrls,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"

const snapPoints = ["50%"]

type Props = {
    handleClose: () => void
}

export const AddUrlBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ handleClose }, ref) => {
    const [newUrl, setNewUrl] = useState("")
    const dispatch = useAppDispatch()
    const delegationUrls = useAppSelector(selectDelegationUrls)
    const { LL } = useI18nContext()
    const handleAddUrl = () => {
        if (!delegationUrls.includes(newUrl)) {
            dispatch(addDelegationUrl(newUrl))
        }
        setNewUrl("")
        handleClose()
    }
    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <ScrollViewWithFooter
                footer={
                    <BaseView flexDirection="row">
                        <BaseButton
                            haptics="Light"
                            title={LL.COMMON_BTN_CANCEL()}
                            action={handleClose}
                            variant="outline"
                            flex={1}
                        />
                        <BaseSpacer width={16} />
                        <BaseButton
                            haptics="Light"
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
                <BaseTextInput
                    value={newUrl}
                    onChangeText={setNewUrl}
                    placeholder={LL.SEND_DELEGATION_ADD_URL_PLACEHOLDER()}
                    testID="AddUrl_input"
                />
            </ScrollViewWithFooter>
        </BaseBottomSheet>
    )
})
