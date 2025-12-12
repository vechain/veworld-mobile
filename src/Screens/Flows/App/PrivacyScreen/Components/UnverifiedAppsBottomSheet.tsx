import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useCallback } from "react"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { setDeveloperAppsEnabled, useAppDispatch } from "~Storage/Redux"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
}

export const UnverifiedAppsBottomSheet = ({ bsRef }: Props) => {
    const { LL } = useI18nContext()
    const { ref, onClose } = useBottomSheetModal({ externalRef: bsRef })
    const theme = useTheme()

    const dispatch = useAppDispatch()
    const onAllow = useCallback(() => {
        dispatch(setDeveloperAppsEnabled(true))
        onClose()
    }, [dispatch, onClose])

    return (
        <DefaultBottomSheet
            ref={ref}
            title={LL.SETTING_UNVERIFIED_APP_MODAL_TITLE()}
            description={LL.SETTING_UNVERIFIED_APP_MODAL_SUBTITLE()}
            icon="icon-alert-triangle"
            buttonsInLine
            mainButton={
                <BaseButton variant="solid" action={onClose} flex={1} testID="UNVERIFIED_APPS_BS_BACK">
                    {LL.SETTING_UNVERIFIED_APP_MODAL_CTA_BACK()}
                </BaseButton>
            }
            secondaryButton={
                <BaseButton variant="outline" action={onAllow} flex={1} testID="UNVERIFIED_APPS_BS_ALLOW">
                    {LL.SETTING_UNVERIFIED_APP_MODAL_CTA_ALLOW()}
                </BaseButton>
            }
            iconSize={40}
            buttonsGap={16}
            backgroundColor={theme.isDark ? COLORS.DARK_PURPLE : COLORS.APP_BACKGROUND_LIGHT}
        />
    )
}
