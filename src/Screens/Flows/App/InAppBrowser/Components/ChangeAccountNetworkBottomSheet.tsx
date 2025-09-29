import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    TargetEvent,
    useInAppBrowser,
} from "~Components"
import { SelectableAccountCard } from "~Components/Reusable/SelectableAccountCard"
import { useTheme } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"

type Props = {}

export const ChangeAccountNetworkBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({}, ref) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { handleCloseChangeAccountNetworkBottomSheet, handleConfirmChangeAccountNetworkBottomSheet } =
        useInAppBrowser()

    return (
        <BaseBottomSheet<TargetEvent>
            dynamicHeight
            ref={ref}
            enableDismissOnClose={false}
            enablePanDownToClose={false}
            onPressOutside={"none"}>
            {event => (
                <BaseView mt={16}>
                    <BaseView
                        flexDirection="row"
                        gap={12}
                        justifyContent="space-between"
                        testID="SWITCH_WALLET_REQUEST_TITLE">
                        <BaseView flex={1} flexDirection="row" gap={12}>
                            <BaseIcon name="icon-user-cog" size={20} color={theme.colors.editSpeedBs.title} />
                            <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                                {LL.BROWSER_CHANGE_ACCOUNT_TITLE()}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseView>
                        <BaseText typographyFont="subSubTitleLight">{LL.BROWSER_CHANGE_ACCOUNT_DESC()}</BaseText>
                        <BaseSpacer height={16} />
                        <SelectableAccountCard account={event.targetAccount} balanceToken="FIAT" disabled />
                    </BaseView>
                    <BaseSpacer height={24} />
                    <BaseView flexDirection="row" justifyContent="space-between" gap={16} mb={16}>
                        <BaseButton
                            flex={1}
                            haptics="Light"
                            variant="outline"
                            title={LL.COMMON_BTN_CANCEL().toUpperCase()}
                            action={() => handleCloseChangeAccountNetworkBottomSheet(event)}
                        />
                        <BaseButton
                            flex={1}
                            haptics="Light"
                            title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                            action={() => handleConfirmChangeAccountNetworkBottomSheet(event)}
                        />
                    </BaseView>
                </BaseView>
            )}
        </BaseBottomSheet>
    )
})
