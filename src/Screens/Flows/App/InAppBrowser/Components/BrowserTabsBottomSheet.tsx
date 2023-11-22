import React, { useMemo } from "react"
import { BaseBottomSheet, BaseText, BaseView } from "~Components"
import { isSmallScreen } from "~Constants"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"

type Props = {
    onClose: () => void
}

export const BrowserTabsBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({}, ref) => {
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => {
        return isSmallScreen ? ["60%"] : ["52%"]
    }, [])

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                w={100}
                h={100}
                flexGrow={1}
                justifyContent="space-between">
                <BaseView>
                    <BaseView
                        flexDirection="row"
                        justifyContent="space-between"
                        w={100}
                        alignItems="center">
                        <BaseText typographyFont="subTitleBold">
                            {LL.BROWSER_TAB_MANAGEMENT_TITLE()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
