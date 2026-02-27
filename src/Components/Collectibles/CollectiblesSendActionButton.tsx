import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { CollectiblesActionButton } from "./CollectiblesActionButton"

type Props = {
    address: string
    tokenId: string
    onClose: () => void
}
export const CollectiblesSendActionButton = ({ address, tokenId, onClose }: Props) => {
    const { LL } = useI18nContext()

    const nav = useNavigation()

    const onPress = useCallback(async () => {
        onClose()

        nav.navigate(Routes.SEND_NFT, {
            contractAddress: address,
            tokenId,
        })
    }, [address, nav, onClose, tokenId])

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
