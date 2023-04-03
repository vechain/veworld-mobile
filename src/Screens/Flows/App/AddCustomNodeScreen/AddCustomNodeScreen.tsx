import { StyleSheet } from "react-native"
import React, { useCallback, useEffect, useState } from "react"
import { useI18nContext } from "~i18n"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
} from "~Components"
import { URLUtils, useTheme } from "~Common"
import { useNavigation } from "@react-navigation/native"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import {
    selectCustomNetworks,
    useAppDispatch,
    useAppSelector,
    validateAndAddCustomNode,
} from "~Storage"

export const AddCustomNodeScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
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
        if (isSubmitDisabled) return
        setIsSubmitting(true)
        try {
            await dispatch(
                validateAndAddCustomNode({ name: nodeName, url: nodeUrl }),
            )
        } catch (e) {
            console.log("error", e)
        }
        setIsSubmitting(false)
    }, [setIsSubmitting, dispatch, isSubmitDisabled, nodeName, nodeUrl])

    const validateUrlInput = useCallback(
        (value: string): string => {
            console.log("value", value)
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
            const error = validateUrlInput(nodeUrl)
            setNodeUrlError(error)
        }
    }, [nodeUrl, validateUrlInput])

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={12} />
            <BaseView
                mx={20}
                flexGrow={1}
                justifyContent="space-between"
                alignItems="center"
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
                    title={
                        isSubmitting
                            ? "....."
                            : LL.NETWORK_ADD_CUSTOM_NODE_ADD_NETWORK()
                    }
                    disabled={isSubmitting || isSubmitDisabled}
                    radius={16}
                />
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
})
