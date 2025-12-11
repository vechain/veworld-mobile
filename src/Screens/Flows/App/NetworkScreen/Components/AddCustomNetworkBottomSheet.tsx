import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useMutation } from "@tanstack/react-query"
import * as Haptics from "expo-haptics"
import React, { RefObject, useCallback, useMemo, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { z } from "zod"
import { AlertInline, BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { COLORS, ColorThemeType, ERROR_EVENTS } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectNetworks, useAppDispatch, useAppSelector, validateAndAddCustomNode } from "~Storage/Redux"
import { URIUtils, warn } from "~Utils"
import FontUtils from "~Utils/FontUtils"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
}

const urlSchema = z
    .string()
    .url()
    .refine(url => URIUtils.isAllowed(url))

export const AddCustomNetworkBottomSheet = ({ bsRef }: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const allNodes = useAppSelector(selectNetworks)

    const { onClose } = useBottomSheetModal({ externalRef: bsRef })

    const [name, setName] = useState("")
    const [url, setUrl] = useState("")

    const [urlError, setUrlError] = useState(false)

    const dispatch = useAppDispatch()

    const disabled = useMemo(() => !name.trim() || !url.trim() || urlError, [name, url, urlError])

    const mutationFn = useCallback(async () => {
        Keyboard.dismiss()
        if (disabled) return
        try {
            await dispatch(
                validateAndAddCustomNode({
                    name,
                    url,
                }),
            ).unwrap()

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Feedback.show({
                message: LL.NETWORK_ADDED(),
                severity: FeedbackSeverity.SUCCESS,
                type: FeedbackType.ALERT,
                icon: "icon-check",
            })
        } catch (e) {
            warn(ERROR_EVENTS.SETTINGS, "onAddNetworkPress", e)
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            setUrlError(true)
            throw e
        }
    }, [LL, disabled, dispatch, name, url])

    const { mutate: onConfirm, isPending } = useMutation({
        mutationKey: ["CUSTOM_NODE", "CREATE"],
        gcTime: 0,
        mutationFn: mutationFn,
        onSuccess: onClose,
    })

    const onUrlChange = useCallback(
        (text: string) => {
            setUrl(text)
            const parsedUrl = urlSchema.safeParse(text)
            const urlAlreadyExist = allNodes.some(net => net.currentUrl === text)
            setUrlError(!parsedUrl.success || urlAlreadyExist)
        },
        [allNodes],
    )

    return (
        <BaseBottomSheet ref={bsRef} dynamicHeight>
            <BaseView flex={1} flexDirection="row" gap={12}>
                <BaseIcon name="icon-users" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {LL.NETWORK_ADD_CUSTOM_NETWORK()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={8} />
            <BaseText typographyFont="bodyMedium" color={theme.colors.editSpeedBs.subtitle}>
                {LL.NETWORK_ADD_CUSTOM_NETWORK_DESC()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseView gap={8} flexDirection="column">
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}>
                    {LL.NETWORK_ADD_CUSTOM_NETWORK_NAME_INPUT_LABEL()}
                </BaseText>
                <BottomSheetTextInput
                    testID="ADD_CUSTOM_NETWORK_NAME_INPUT"
                    placeholder={LL.NETWORK_ADD_CUSTOM_NETWORK_NAME_INPUT_PLACEHOLDER()}
                    contextMenuHidden
                    value={name}
                    autoFocus={true}
                    placeholderTextColor={COLORS.GREY_400}
                    onChangeText={setName}
                    style={styles.input}
                />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseView gap={8} flexDirection="column">
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}>
                    {LL.NETWORK_ADD_CUSTOM_NETWORK_URL_INPUT_LABEL()}
                </BaseText>
                <BottomSheetTextInput
                    testID="ADD_CUSTOM_NETWORK_URL_INPUT"
                    placeholder={LL.NETWORK_ADD_CUSTOM_NETWORK_URL_INPUT_PLACEHOLDER()}
                    contextMenuHidden
                    value={url}
                    placeholderTextColor={COLORS.GREY_400}
                    onChangeText={onUrlChange}
                    style={styles.input}
                />
                <AlertInline
                    message={LL.NETWORK_ADD_CUSTOM_NETWORK_URL_INPUT_ERROR()}
                    status="error"
                    style={[styles.alert, urlError && styles.alertVisible]}
                />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16}>
                <BaseButton variant="outline" action={onClose} flex={1}>
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton
                    variant="solid"
                    action={onConfirm}
                    disabled={disabled || isPending}
                    isLoading={isPending}
                    flex={1}>
                    {LL.BTN_CONFIRM()}
                </BaseButton>
            </BaseView>
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        input: {
            borderRadius: 8,
            borderWidth: theme.isDark ? 2 : 1,
            backgroundColor: theme.colors.card,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_200,
            color: theme.isDark ? COLORS.GREY_200 : COLORS.GREY_600,
            fontSize: FontUtils.font(14),
            lineHeight: 20,
        },
        alert: {
            pointerEvents: "none",
            opacity: 0,
        },
        alertVisible: {
            opacity: 1,
        },
    })
