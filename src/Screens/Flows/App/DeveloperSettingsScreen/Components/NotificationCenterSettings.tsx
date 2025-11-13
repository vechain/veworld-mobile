import React, { useCallback, useMemo } from "react"
import { z } from "zod"
import { BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import HapticsService from "~Services/HapticsService"
import { selectNotificationCenterUrl, setNotificationCenterUrl, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { Accordion } from "./Accordion"
import { ResettableTextInput } from "./ResettableTextInput"

export const NotificationCenterSettings = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const storedUrl = useAppSelector(selectNotificationCenterUrl)

    const onSave = useCallback(
        async (value: string) => {
            try {
                dispatch(setNotificationCenterUrl(value || undefined))
                await HapticsService.triggerHaptics({ haptics: "Success" })
            } catch (e) {
                await HapticsService.triggerHaptics({ haptics: "Error" })
            }
        },
        [dispatch],
    )

    const validationSchema = useMemo(
        () =>
            z
                .string({ message: LL.COMMON_ERROR_URL_NOT_VALID() })
                .url({ message: LL.COMMON_ERROR_URL_NOT_VALID() })
                .optional(),
        [LL],
    )
    return (
        <Accordion>
            <Accordion.Header>
                <Accordion.HeaderText>{LL.DEVELOPER_NOTIFICATION_CENTER_TITLE()}</Accordion.HeaderText>
                <Accordion.HeaderIcon />
            </Accordion.Header>
            <Accordion.Content>
                <BaseView flexDirection="column" gap={8}>
                    <ResettableTextInput
                        label={LL.DEVELOPER_SETTING_NOTIFICATION_URL()}
                        placeholder={LL.COMMON_LBL_ENTER_THE({
                            name: LL.COMMON_LBL_URL(),
                        })}
                        description={LL.DEVELOPER_NOTIFICATION_CENTER_DESC()}
                        defaultValue={storedUrl}
                        onSave={onSave}
                        validationSchema={validationSchema}
                    />
                </BaseView>
            </Accordion.Content>
        </Accordion>
    )
}
