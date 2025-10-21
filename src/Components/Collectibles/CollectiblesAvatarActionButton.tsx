import * as FileSystem from "expo-file-system"
import React, { useCallback, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { CollectiblesActionButton } from "./CollectiblesActionButton"

type Props = {
    image: string | undefined
    address: string
    tokenId: string
}
export const CollectiblesAvatarActionButton = ({ image }: Props) => {
    const { LL } = useI18nContext()

    //TODO fix
    const isAvatar = false

    const icon = useMemo<IconKey>(() => {
        if (isAvatar) return "icon-check-circle-2"
        return "icon-smile"
    }, [isAvatar])

    const onPress = useCallback(async () => {
        if (!image) return
        //Set account avatar with image
        await FileSystem.downloadAsync(image, `${FileSystem.documentDirectory}pfp`)
    }, [image])

    return (
        <CollectiblesActionButton
            active={isAvatar}
            icon={icon}
            onPress={onPress}
            label={LL[`COLLECTIBLES_ACTION_AVATAR_${isAvatar ? "ACTIVE" : "INACTIVE"}`]()}
        />
    )
}
