import React, { useCallback, useState } from "react"
import { useI18nContext } from "~i18n"
import { BaseButton, BaseSpacer, BaseText, BaseTextInput, BaseView, Layout } from "~Components"
import { URIUtils } from "~Utils"
import { useNavigation } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setNotificationCenterUrl } from "~Storage/Redux/Slices/UserPreferences"
import { selectNotificationCenterUrl } from "~Storage/Redux/Selectors/UserPreferences"
import * as Haptics from "expo-haptics"

export const DeveloperSettingsScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const storedUrl = useAppSelector(selectNotificationCenterUrl)

    const [url, setUrl] = useState(storedUrl || "")
    const [urlError, setUrlError] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)

    const isSubmitDisabled = !!urlError

    const goBack = useCallback(() => nav.goBack(), [nav])

    const onSavePress = useCallback(async () => {
        if (isSubmitDisabled) return
        setIsSubmitting(true)

        try {
            dispatch(setNotificationCenterUrl(url || undefined))
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            goBack()
        } catch (e) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
        setIsSubmitting(false)
    }, [dispatch, isSubmitDisabled, url, goBack])

    const validateUrlInput = useCallback(
        (value: string): string => {
            if (!value) return ""

            if (!URIUtils.isValid(value)) return LL.ERROR_URL_NOT_VALID()

            return ""
        },
        [LL],
    )

    const handleChangeUrl = useCallback(
        (newUrl: string) => {
            setUrl(newUrl)
            setUrlError(validateUrlInput(newUrl))
        },
        [validateUrlInput],
    )

    return (
        <Layout
            title={LL.TITLE_DEVELOPER_SETTINGS()}
            body={
                <BaseView flexGrow={1} justifyContent="space-between">
                    <BaseView>
                        <BaseSpacer height={12} />
                        <BaseText typographyFont="button" pb={8}>
                            {LL.DEVELOPER_NOTIFICATION_CENTER_TITLE()}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">{LL.DEVELOPER_NOTIFICATION_CENTER_DESC()}</BaseText>
                        <BaseSpacer height={24} />
                        <BaseTextInput
                            placeholder={LL.COMMON_LBL_ENTER_THE({
                                name: LL.COMMON_LBL_URL(),
                            })}
                            label={LL.COMMON_LBL_URL()}
                            value={url}
                            setValue={handleChangeUrl}
                            errorMessage={urlError}
                        />
                    </BaseView>
                </BaseView>
            }
            footer={
                <BaseButton
                    haptics="Light"
                    action={onSavePress}
                    w={100}
                    px={20}
                    isLoading={isSubmitting}
                    title={LL.COMMON_BTN_SAVE()}
                    disabled={isSubmitting || isSubmitDisabled}
                    radius={16}
                />
            }
        />
    )
}
