import React, { useCallback, useEffect, useState } from "react"
import { useI18nContext } from "~i18n"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    hideToast,
    showErrorToast,
    DismissKeyboardView,
} from "~Components"
import { error } from "~Common"
import { URLUtils } from "~Utils"
import { useNavigation } from "@react-navigation/native"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import {
    selectCustomNetworks,
    useAppDispatch,
    useAppSelector,
    validateAndAddCustomNode,
} from "~Storage/Redux"
import * as Haptics from "expo-haptics"

export const AddCustomNodeScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const tabBarHeight = useBottomTabBarHeight()
    const customNodes = useAppSelector(selectCustomNetworks)
    const dispatch = useAppDispatch()

    const [nodeName, setNodeName] = useState("")
    const [nodeUrl, setNodeUrl] = useState("")
    const [nodeUrlError, setNodeUrlError] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)

    const isSubmitDisabled = !nodeName || !nodeUrl || !!nodeUrlError

    const goBack = useCallback(() => nav.goBack(), [nav])

    const onAddNetworkPress = useCallback(async () => {
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

            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            )
            goBack()
        } catch (e) {
            error(e)
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
            )
            showErrorToast(e as string)
        }
        setIsSubmitting(false)
    }, [setIsSubmitting, dispatch, isSubmitDisabled, nodeName, nodeUrl, goBack])

    const validateUrlInput = useCallback(
        (value: string): string => {
            if (!value) return LL.ERROR_ENTER_VALID_URL()

            if (!URLUtils.isAllowed(value)) return LL.ERROR_URL_NOT_VALID()

            const urlAlreadyExist = customNodes.find(
                net => net.currentUrl === value,
            )
            if (urlAlreadyExist) return LL.ERROR_URL_ALREADY_USED()

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
        <DismissKeyboardView>
            <BaseSafeArea grow={1}>
                <BackButtonHeader />
                <BaseSpacer height={12} />
                <BaseView
                    mx={20}
                    flexGrow={1}
                    justifyContent="space-between"
                    pb={tabBarHeight}>
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
                        action={onAddNetworkPress}
                        w={100}
                        px={20}
                        isLoading={isSubmitting}
                        title={LL.NETWORK_ADD_CUSTOM_NODE_ADD_NETWORK()}
                        disabled={isSubmitting || isSubmitDisabled}
                        radius={16}
                    />
                </BaseView>
            </BaseSafeArea>
        </DismissKeyboardView>
    )
}
