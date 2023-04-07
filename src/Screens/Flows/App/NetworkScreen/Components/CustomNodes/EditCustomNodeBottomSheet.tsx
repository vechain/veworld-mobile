import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseIcon,
    BaseTextInput,
    BaseButton,
    hideToast,
    showErrorToast,
} from "~Components"
import { useI18nContext } from "~i18n"

import { URLUtils, error, useTheme } from "~Common"
import { Network } from "~Model"
import {
    selectCustomNetworks,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import * as Haptics from "expo-haptics"

type Props = {
    onClose: () => void
    network: Network
}

const snapPoints = ["50%", "90%"]

export const EditCustomNodeBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const customNodes = useAppSelector(selectCustomNetworks)

    const dispatch = useAppDispatch()

    const [nodeName, setNodeName] = useState("")
    const [nodeUrl, setNodeUrl] = useState("")
    const [nodeUrlError, setNodeUrlError] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)

    const isSubmitDisabled = !nodeName || !nodeUrl || !!nodeUrlError

    const handleSheetChanges = useCallback((index: number) => {
        console.log("EditCustomNodeSheet position changed", index)
    }, [])

    const onEditNetworkPress = useCallback(async () => {
        hideToast()
        if (isSubmitDisabled) return
        setIsSubmitting(true)
        try {
            await dispatch(
                validateAndAddCustomNode({
                    name: nodeName,
                    url: nodeUrl,
                }),
            ).unwrap()

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            onClose()
        } catch (e) {
            error(e)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            showErrorToast(e as string)
        }
        setIsSubmitting(false)
    }, [
        setIsSubmitting,
        dispatch,
        isSubmitDisabled,
        nodeName,
        nodeUrl,
        onClose,
    ])

    const validateUrlInput = useCallback(
        (value: string): string => {
            if (!value) return LL.ERROR_ENTER_VALID_URL()

            if (!URLUtils.isAllowed(value)) return LL.ERROR_URL_NOT_VALID()

            const urlAlreadyExist = customNodes.find(
                net => net.currentUrl === value,
            )
            if (urlAlreadyExist) return LL.ERROR_URL_ALREADY_USER()

            return ""
        },
        [customNodes, LL],
    )

    useEffect(() => {
        if (nodeUrl) {
            setNodeUrlError(validateUrlInput(nodeUrl))
        }
    }, [nodeUrl, validateUrlInput])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onChange={handleSheetChanges}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BD_CUSTOM_NODES()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={onEditNetworkPress}
                />
            </BaseView>

            <BaseSpacer height={16} />
            <BaseView
                mx={20}
                flexGrow={1}
                justifyContent="space-between"
                alignItems="center">
                <BaseView>
                    <BaseText typographyFont="title">
                        {LL.BTN_ADD_CUSTOM_NODE()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="button" pb={8}>
                        {LL.NETWORK_ADD_CUSTOM_NODE_SB()}
                    </BaseText>
                    <BaseText typographyFont="captionRegular">
                        {LL.NETWORK_ADD_CUSTOM_NODE_SB_DESC()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseTextInput
                        placeholder={LL.COMMON_LBL_ENTER_THE({
                            name: LL.COMMON_LBL_NAME(),
                        })}
                        label={LL.NETWORK_ADD_CUSTOM_NODE_NAME()}
                        value={nodeName}
                        setValue={setNodeName}
                    />
                    <BaseSpacer height={16} />
                    <BaseTextInput
                        placeholder={LL.COMMON_LBL_ENTER_THE({
                            name: LL.COMMON_LBL_URL(),
                        })}
                        label={LL.COMMON_LBL_URL()}
                        value={nodeUrl}
                        setValue={setNodeUrl}
                        errorMessage={nodeUrlError}
                    />
                </BaseView>
                <BaseButton
                    action={onEditNetworkPress}
                    w={100}
                    px={20}
                    isLoading={isSubmitting}
                    title={LL.NETWORK_ADD_CUSTOM_NODE_ADD_NETWORK()}
                    disabled={isSubmitting || isSubmitDisabled}
                    radius={16}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})
