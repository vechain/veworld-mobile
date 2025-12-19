import * as FileSystem from "expo-file-system"
import React, { useCallback, useMemo, useState } from "react"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
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
import { AddressUtils, MediaUtils, warn } from "~Utils"
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

    const [isPending, setIsPending] = useState(false)

    const isAvatar = useMemo(() => {
        if (!account.profileImage) return false
        if (account.profileImage.genesisId !== network.genesis.id) return false
        if (account.profileImage.tokenId !== tokenId) return false
        if (!AddressUtils.compareAddresses(account.profileImage.address, address)) return false
        return true
    }, [account.profileImage, address, network.genesis.id, tokenId])

    const icon = useMemo<IconKey>(() => {
        if (isPending || isAvatar) return "icon-check-circle-2"
        return "icon-smile"
    }, [isPending, isAvatar])

    const onPress = useCallback(async () => {
        if (!image || isPending) return

        const pfpDir = `${FileSystem.documentDirectory}pfp/`
        const fileName = `${account.address}_${Date.now()}.${MediaUtils.resolveFileExtensionFromMimeType(
            mimeType ?? "image/png",
        )}`
        const persistentPath = `${pfpDir}${fileName}`
        const hadPreviousAvatar = !!account.profileImage?.uri

        if (isAvatar) {
            const oldUri = account.profileImage?.uri
                ? `${FileSystem.documentDirectory}${account.profileImage.uri}`
                : undefined

            dispatch(clearAccountPfp({ accountAddress: account.address }))
            track(AnalyticsEvent.NFT_COLLECTIBLE_AVATAR_DELETED, { collectionAddress: address })

            if (oldUri) {
                FileSystem.deleteAsync(oldUri, { idempotent: true }).catch(() => {})
            }
            return
        }

        setIsPending(true)

        try {
            const dirInfo = await FileSystem.getInfoAsync(pfpDir)
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(pfpDir, { intermediates: true })
            }
            await FileSystem.downloadAsync(image, persistentPath)

            dispatch(
                setAccountPfp({
                    accountAddress: account.address,
                    pfp: { address, tokenId, genesisId: network.genesis.id, uri: `pfp/${fileName}` },
                }),
            )

            Feedback.show({
                severity: FeedbackSeverity.INFO,
                type: FeedbackType.ALERT,
                message: LL.FEEDBACK_SET_AVATAR(),
                icon: "icon-smile",
            })

            track(
                hadPreviousAvatar
                    ? AnalyticsEvent.NFT_COLLECTIBLE_AVATAR_CHANGED
                    : AnalyticsEvent.NFT_COLLECTIBLE_AVATAR_SET,
                { collectionAddress: address },
            )
        } catch (err) {
            warn(ERROR_EVENTS.PROFILE, `Set avatar failed for account ${account.address}`, err)
        } finally {
            setIsPending(false)
        }
    }, [
        LL,
        account.address,
        account.profileImage?.uri,
        address,
        dispatch,
        image,
        isAvatar,
        isPending,
        mimeType,
        network.genesis.id,
        tokenId,
        track,
    ])

    return (
        <CollectiblesActionButton
            active={isPending || isAvatar}
            icon={icon}
            onPress={onPress}
            label={LL[`COLLECTIBLES_ACTION_AVATAR_${isPending || isAvatar ? "ACTIVE" : "INACTIVE"}`]()}
            testID="COLLECTIBLES_ACTION_AVATAR"
        />
    )
}
