import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject } from "react"
import { BaseBottomSheet, BaseIcon, BaseText, BaseView, useFeatureFlags } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { PlatformUtils } from "~Utils"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
    openReceiveBottomsheet: () => void
}

const ActionButton = ({ label, icon }: { label: string; icon: IconKey }) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" gap={24}>
            <BaseIcon
                name={icon}
                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                size={16}
                p={8}
                bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_100}
            />
            <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_800}>
                {label}
            </BaseText>
        </BaseView>
    )
}

export const MoreButtonBottomSheet = ({ bsRef }: Props) => {
    const { LL } = useI18nContext()
    const { paymentProvidersFeature } = useFeatureFlags()
    const theme = useTheme()
    const { ref } = useBottomSheetModal({ externalRef: bsRef })

    return (
        <BaseBottomSheet ref={ref} backgroundStyle={{ backgroundColor: theme.colors.card }}>
            <ActionButton icon="icon-qr-code" label={LL.BALANCE_ACTION_RECEIVE()} />
            <ActionButton icon="icon-arrow-up" label={LL.BALANCE_ACTION_SEND()} />
            <ActionButton icon="icon-plus" label={LL.BALANCE_ACTION_BUY()} />
            <ActionButton icon="icon-stargate" label={LL.BALANCE_ACTION_EARN()} />
            <ActionButton icon="icon-arrow-left-right" label={LL.SWAP()} />
            {PlatformUtils.isAndroid() && paymentProvidersFeature.coinify.android && (
                <ActionButton icon="icon-minus" label={LL.BTN_SELL()} />
            )}
        </BaseBottomSheet>
    )
}
