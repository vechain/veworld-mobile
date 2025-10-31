import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { MoreButtonBottomSheet } from "./MoreButtonBottomSheet"

type Props = {
    openReceiveBottomsheet: () => void
    token: FungibleTokenWithBalance
}

export const MoreButton = ({ openReceiveBottomsheet, token }: Props) => {
    const { LL } = useI18nContext()
    const { ref: ref, onOpen: onOpen } = useBottomSheetModal()

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
            />
            <MoreButtonBottomSheet bsRef={ref} openReceiveBottomsheet={openReceiveBottomsheet} token={token} />
        </>
    )
}
