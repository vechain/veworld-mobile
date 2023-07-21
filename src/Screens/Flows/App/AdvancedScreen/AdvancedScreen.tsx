import React, { useCallback } from "react"
import {
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    EnableFeature,
} from "~Components"
import { Reset } from "./Components/Reset"
import { useI18nContext } from "~i18n"
import {
    selectSentryTrackingEnabled,
    setSentryTrackingEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const AdvancedScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const sentryTrackingEnabled = useAppSelector(selectSentryTrackingEnabled)
    const toggleSentryTrackingSwitch = useCallback(
        (newValue: boolean) => {
            dispatch(setSentryTrackingEnabled(newValue))
        },
        [dispatch],
    )

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />

            <BaseView mx={20}>
                <BaseText typographyFont="title">
                    {LL.TITLE_ADVANCED()}
                </BaseText>

                <BaseSpacer height={24} />
                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_RESET()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_RESET_DISCLAIMER()}
                </BaseText>
                <BaseSpacer height={16} />
                <Reset />

                <BaseSpacer height={24} />
                <EnableFeature
                    title={LL.BD_HELP_IMPROVE()}
                    subtitle={LL.BD_HELP_IMPROVE_DISCLAIMER()}
                    onValueChange={toggleSentryTrackingSwitch}
                    value={sentryTrackingEnabled}
                />
            </BaseView>
        </BaseSafeArea>
    )
}
