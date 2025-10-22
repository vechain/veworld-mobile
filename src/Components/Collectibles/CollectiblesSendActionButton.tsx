import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { CollectiblesActionButton } from "./CollectiblesActionButton"

type Props = {
    address: string
    tokenId: string
}
export const CollectiblesSendActionButton = ({ address, tokenId }: Props) => {
    const { LL } = useI18nContext()

    const nav = useNavigation()

    const onPress = useCallback(async () => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            contractAddress: address,
            tokenId,
        })
    }, [address, nav, tokenId])

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
