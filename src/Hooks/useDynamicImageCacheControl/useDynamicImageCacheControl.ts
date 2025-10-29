import { useMemo } from "react"
import FastImage from "react-native-fast-image"
import { URIUtils } from "~Utils"

export const useDynamicImageCacheControl = (uri: string | undefined, mime?: string) => {
    return useMemo(() => {
        //Return default value (it won't be used)
        if (mime === "image/svg+xml") return FastImage.cacheControl.immutable
        if (!uri) return FastImage.cacheControl.immutable
        const parsedUrl = new URL(uri)
        //If the URL is for an ArWeave resource or IPFS, then it's technically immutable
        //Otherwise respect HTTP headers
        if ([URIUtils.IPFS_GATEWAY_HOSTNAME, URIUtils.ARWEAVE_GATEWAY_HOSTNAME].includes(parsedUrl.hostname))
            return FastImage.cacheControl.immutable
        return FastImage.cacheControl.web
    }, [mime, uri])
}
