import { useQuery } from "@tanstack/react-query"
import React, { memo } from "react"
import { NFTImageComponent } from "~Components/Reusable/NFTImage"
import { useNFTMedia } from "~Hooks"
import { BaseAccountPfp, BaseAccountPfpProps } from "./BaseAccountPfp"

type Props = {
    uri: string
} & BaseAccountPfpProps

export const VetDomainsAccountPfp = memo<Props>(({ uri, size = 50, ...props }) => {
    const { fetchMedia } = useNFTMedia()

    const { data: media } = useQuery({
        queryKey: ["COLLECTIBLES", "MEDIA", uri],
        queryFn: () => fetchMedia(uri!),
        enabled: !!uri,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })

    return (
        <BaseAccountPfp size={size} {...props}>
            <NFTImageComponent
                resizeMode="contain"
                uri={media?.image}
                mime={media?.mime}
                style={{ width: size, height: size }}
            />
        </BaseAccountPfp>
    )
})
