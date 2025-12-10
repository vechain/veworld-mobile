import React, { useCallback } from "react"
import { BaseSpacer, BaseSwitch, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useI18nContext } from "~i18n"
import { selectDeveloperAppsEnabled, setDeveloperAppsEnabled, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { UnverifiedAppsBottomSheet } from "./UnverifiedAppsBottomSheet"

export const UnverifiedApps = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const enabled = useAppSelector(selectDeveloperAppsEnabled)

    const { ref, onOpenPlain } = useBottomSheetModal()

    const dispatch = useAppDispatch()

    const onValueChange = useCallback(
        (newValue: boolean) => {
            if (newValue) onOpenPlain()
            else dispatch(setDeveloperAppsEnabled(false))
        },
        [dispatch, onOpenPlain],
    )

    return (
        <BaseView>
            <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}>
                {LL.SETTING_UNVERIFIED_APP_TITLE()}
            </BaseText>
            <BaseSpacer height={4} />
            <BaseText typographyFont="captionRegular" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}>
                {LL.SETTING_UNVERIFIED_APP_SUBTITLE()}
            </BaseText>
            <BaseSpacer height={16} />

            <BaseView p={16} bg={theme.colors.card} gap={16} flexDirection="row" borderRadius={12} alignItems="center">
                <BaseText
                    typographyFont="captionRegular"
                    color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}
                    flex={1}
                    flexDirection="row">
                    {LL.SETTING_UNVERIFIED_APP_TOGGLE_CTA()}
                </BaseText>
                <BaseSwitch onValueChange={onValueChange} value={enabled} testID="UNVERIFIED_APP_TOGGLE" />
            </BaseView>
            <UnverifiedAppsBottomSheet bsRef={ref} />
        </BaseView>
    )
}
