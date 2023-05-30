import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseButton,
    hideToast,
    showErrorToast,
    BaseBottomSheetTextInput,
} from "~Components"
import { useI18nContext } from "~i18n"

import { error, isSmallScreen } from "~Common"
import { URLUtils } from "~Utils"
import { Network } from "~Model"
import {
    selectCustomNetworks,
    useAppDispatch,
    useAppSelector,
    validateAndUpdateCustomNode,
} from "~Storage/Redux"
import * as Haptics from "expo-haptics"

type Props = {
    onClose: () => void
    network?: Network
}

const snapPoints = [isSmallScreen ? "60%" : "52%"]

export const EditCustomNodeBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, network }, ref) => {
    const { LL } = useI18nContext()

    const customNodes = useAppSelector(selectCustomNetworks)

    const dispatch = useAppDispatch()

    const [nodeName, setNodeName] = useState(network?.name)
    const [nodeUrl, setNodeUrl] = useState(network?.currentUrl)
    const [nodeUrlError, setNodeUrlError] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)

    const isSubmitDisabled = !nodeName || !nodeUrl || !!nodeUrlError

    const onEditNetworkPress = useCallback(async () => {
        hideToast()
        if (isSubmitDisabled || !network?.id) return
        setIsSubmitting(true)
        try {
            await dispatch(
                validateAndUpdateCustomNode({
                    networkToUpdateId: network.id,
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
        network,
    ])

    const validateUrlInput = useCallback(
        (value: string): string => {
            if (!value) return LL.ERROR_ENTER_VALID_URL()

            if (!URLUtils.isAllowed(value)) return LL.ERROR_URL_NOT_VALID()

            const urlAlreadyExist = customNodes.find(
                net => net.currentUrl === value && net.id !== network?.id,
            )
            if (urlAlreadyExist) return LL.ERROR_URL_ALREADY_USED()

            return ""
        },
        [network, customNodes, LL],
    )

    useEffect(() => {
        setNodeName(network?.name || "")
        setNodeUrl(network?.currentUrl || "")
    }, [network])

    useEffect(() => {
        if (nodeUrl) {
            setNodeUrlError(validateUrlInput(nodeUrl))
        }
    }, [nodeUrl, validateUrlInput])

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                w={100}
                h={100}
                flexGrow={1}
                justifyContent="space-between">
                <BaseView>
                    <BaseView flexDirection="row" w={100}>
                        <BaseText typographyFont="subTitleBold">
                            {LL.BTN_EDIT_CUSTOM_NODE()}
                        </BaseText>
                    </BaseView>

                    <BaseSpacer height={16} />
                    <BaseBottomSheetTextInput
                        placeholder={LL.COMMON_LBL_ENTER_THE({
                            name: LL.COMMON_LBL_NAME(),
                        })}
                        label={LL.NETWORK_ADD_CUSTOM_NODE_NAME()}
                        value={nodeName}
                        setValue={setNodeName}
                    />
                    <BaseSpacer height={16} />
                    <BaseBottomSheetTextInput
                        placeholder={LL.COMMON_LBL_ENTER_THE({
                            name: LL.COMMON_LBL_URL(),
                        })}
                        label={LL.COMMON_LBL_URL()}
                        value={nodeUrl}
                        setValue={setNodeUrl}
                        errorMessage={nodeUrlError}
                    />
                </BaseView>
                <BaseView mb={20} w={100}>
                    <BaseButton
                        action={onEditNetworkPress}
                        w={100}
                        px={20}
                        isLoading={isSubmitting}
                        title={LL.NETWORK_ADD_CUSTOM_NODE_EDIT_NETWORK()}
                        disabled={isSubmitting || isSubmitDisabled}
                        radius={16}
                    />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
