import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance, IconKey } from "~Model"
import { BuyButton } from "./BuyButton"
import { EarnButton } from "./EarnButton"
import { ReceiveButton } from "./ReceiveButton"
import { SellButton } from "./SellButton"
import { SendButton } from "./SendButton"
import { SwapButton } from "./SwapButton"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
    openReceiveBottomsheet: () => void
    token: FungibleTokenWithBalance
}

const ActionButton = ({ label, icon, onPress }: { label: string; icon: IconKey; onPress: () => void }) => {
    const { styles, theme } = useThemedStyles(actionButtonStyles)
    return (
        <TouchableOpacity style={styles.root} onPress={onPress} testID={`MORE_BUTTON_BS_ITEM_${label.toUpperCase()}`}>
            <BaseIcon
                name={icon}
                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                size={16}
                bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_100}
                style={styles.icon}
            />
            <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_800}>
                {label}
            </BaseText>
        </TouchableOpacity>
    )
}

const actionButtonStyles = () =>
    StyleSheet.create({
        icon: {
            padding: 8,
        },
        root: {
            flexDirection: "row",
            gap: 24,
            paddingVertical: 8,
            alignItems: "center",
        },
    })

export const MoreButtonBottomSheet = ({ bsRef, openReceiveBottomsheet, token }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { ref, onClose } = useBottomSheetModal({ externalRef: bsRef })

    const onReceive = ReceiveButton.use(openReceiveBottomsheet)
    const wrappedReceive = useCallback(() => {
        onClose()
        onReceive()
    }, [onClose, onReceive])
    const { disabled: sendDisabled, onPress: onSend } = SendButton.use(token)
    const wrappedSend = useCallback(() => {
        onClose()
        onSend()
    }, [onClose, onSend])
    const onBuy = BuyButton.use()
    const wrappedBuy = useCallback(() => {
        onClose()
        onBuy()
    }, [onBuy, onClose])
    const onEarn = EarnButton.use()
    const wrappedEarn = useCallback(() => {
        onClose()
        onEarn()
    }, [onClose, onEarn])
    const onSwap = SwapButton.use()
    const wrappedSwap = useCallback(() => {
        onClose()
        onSwap()
    }, [onClose, onSwap])
    const { disabled: sellDisabled, onPress: onSell } = SellButton.use(token)
    const wrappedSell = useCallback(() => {
        onClose()
        onSell()
    }, [onClose, onSell])

    return (
        <BaseBottomSheet ref={ref} backgroundStyle={{ backgroundColor: theme.colors.card }} dynamicHeight floating>
            <BaseView flexDirection="column" gap={12} w={100}>
                <ActionButton icon="icon-qr-code" label={LL.BALANCE_ACTION_RECEIVE()} onPress={wrappedReceive} />
                {!sendDisabled && (
                    <ActionButton icon="icon-arrow-up" label={LL.BALANCE_ACTION_SEND()} onPress={wrappedSend} />
                )}

                <ActionButton icon="icon-plus" label={LL.BALANCE_ACTION_BUY()} onPress={wrappedBuy} />
                <ActionButton icon="icon-stargate" label={LL.BALANCE_ACTION_EARN()} onPress={wrappedEarn} />
                <ActionButton icon="icon-arrow-left-right" label={LL.SWAP()} onPress={wrappedSwap} />
                {!sellDisabled && <ActionButton icon="icon-minus" label={LL.BTN_SELL()} onPress={wrappedSell} />}
            </BaseView>
        </BaseBottomSheet>
    )
}
