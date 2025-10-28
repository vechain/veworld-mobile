import * as FileSystem from "expo-file-system"
import React, { useCallback, useMemo } from "react"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import {
    clearAccountPfp,
    selectSelectedAccount,
    selectSelectedNetwork,
    setAccountPfp,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, MediaUtils } from "~Utils"
import { CollectiblesActionButton } from "./CollectiblesActionButton"

type Props = {
    image: string | undefined
    mimeType: string | undefined
    address: string
    tokenId: string
}
export const CollectiblesAvatarActionButton = ({ image, address, tokenId, mimeType }: Props) => {
    const { LL } = useI18nContext()

    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()

    const isAvatar = useMemo(() => {
        if (!account.profileImage) return false
        if (account.profileImage.genesisId !== network.genesis.id) return false
        if (account.profileImage.tokenId !== tokenId) return false
        if (!AddressUtils.compareAddresses(account.profileImage.address, address)) return false
        return true
    }, [account.profileImage, address, network.genesis.id, tokenId])

    const icon = useMemo<IconKey>(() => {
        if (isAvatar) return "icon-check-circle-2"
        return "icon-smile"
    }, [isAvatar])

    const onPress = useCallback(async () => {
        if (!image) return
        const pfpDir = `${FileSystem.documentDirectory}pfp/`
        const dirInfo = await FileSystem.getInfoAsync(pfpDir)
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(pfpDir, { intermediates: true })
        }
        const fileName = `${account.address}_${Date.now()}.${MediaUtils.resolveFileExtensionFromMimeType(
            mimeType ?? "image/png",
        )}`
        const persistentPath = `${pfpDir}${fileName}`
        if (isAvatar) {
            const oldUri = account.profileImage?.uri
                ? `${FileSystem.documentDirectory}${account.profileImage.uri}`
                : undefined
            if (oldUri) {
                //Clear old file
                await FileSystem.deleteAsync(oldUri, { idempotent: true })
            }
            dispatch(clearAccountPfp({ accountAddress: account.address }))
            track(AnalyticsEvent.NFT_COLLECTIBLE_AVATAR_DELETED, {
                collectionAddress: address,
            })
            return
        }

        //Set account avatar with image
        await FileSystem.downloadAsync(image, persistentPath)

        dispatch(
            setAccountPfp({
                accountAddress: account.address,
                pfp: { address, tokenId, genesisId: network.genesis.id, uri: `pfp/${fileName}` },
            }),
        )

        track(
            account.profileImage?.uri
                ? AnalyticsEvent.NFT_COLLECTIBLE_AVATAR_CHANGED
                : AnalyticsEvent.NFT_COLLECTIBLE_AVATAR_SET,
            {
                collectionAddress: address,
            },
        )
    }, [
        account.address,
        account.profileImage?.uri,
        address,
        dispatch,
        image,
        isAvatar,
        mimeType,
        network.genesis.id,
        tokenId,
        track,
    ])

    return (
        <CollectiblesActionButton
            active={isAvatar}
            icon={icon}
            onPress={onPress}
            label={LL[`COLLECTIBLES_ACTION_AVATAR_${isAvatar ? "ACTIVE" : "INACTIVE"}`]()}
            testID="COLLECTIBLES_ACTION_AVATAR"
        />
    )
}
