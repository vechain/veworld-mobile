import React, { useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { URIUtils } from "~Utils"
import {
    BaseBottomSheet,
    BaseBottomSheetTextInput,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    showWarningToast,
    useThor,
} from "~Components"
import { addDelegationUrl, useAppDispatch } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"

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
        handleClose()
    }
    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <Layout
                noBackButton
                noMargin
                fixedBody={
                    <BaseView
                        flex={1}
                        style={styles.bodyContainer}
                        justifyContent="flex-start">
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
                    </BaseView>
                }
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
                            disabled={!URIUtils.isValid(newUrl)}
                            flex={1}
                        />
                    </BaseView>
                }
            />
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    bodyContainer: { minHeight: 200 },
})
