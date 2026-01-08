import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { useBottomSheetModal, useIsOnline } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { MoreButtonBottomSheet } from "./MoreButtonBottomSheet"

type Props = {
    openReceiveBottomsheet: () => void
    token: FungibleTokenWithBalance
}

export const MoreButton = ({ openReceiveBottomsheet, token }: Props) => {
    const { LL } = useI18nContext()
    const { ref, onOpen } = useBottomSheetModal()

    const isOnline = useIsOnline()

    const onPress = useCallback(() => {
        onOpen()
    }, [onOpen])

    return (
        <>
            <GlassButtonWithLabel
                label={LL.COMMON_BTN_MORE()}
                size="sm"
                icon="icon-more-vertical"
                onPress={onPress}
                themed
                truncateText
                disabled={!isOnline}
            />
            <MoreButtonBottomSheet bsRef={ref} openReceiveBottomsheet={openReceiveBottomsheet} token={token} />
        </>
    )
}
