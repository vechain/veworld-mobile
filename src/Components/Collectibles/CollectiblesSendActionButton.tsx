import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { CollectiblesActionButton } from "./CollectiblesActionButton"
import { useFeatureFlags } from "~Components"

type Props = {
    address: string
    tokenId: string
    onClose: () => void
}
export const CollectiblesSendActionButton = ({ address, tokenId, onClose }: Props) => {
    const { LL } = useI18nContext()

    const nav = useNavigation()
    const { betterWorldFeature } = useFeatureFlags()

    const onPress = useCallback(async () => {
        onClose()
        if (betterWorldFeature.balanceScreen?.send?.enabled) {
            nav.navigate(Routes.SEND_NFT, {
                contractAddress: address,
                tokenId,
            })
            return
        }
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            contractAddress: address,
            tokenId,
        })
    }, [address, nav, onClose, tokenId, betterWorldFeature.balanceScreen?.send?.enabled])

    return (
        <CollectiblesActionButton
            active={false}
            icon="icon-send"
            onPress={onPress}
            label={LL.COLLECTIBLES_ACTION_SEND_INACTIVE()}
            testID="COLLECTIBLES_ACTION_SEND"
        />
    )
}
