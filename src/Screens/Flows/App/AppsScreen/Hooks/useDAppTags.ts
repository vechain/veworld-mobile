import { useCallback } from "react"
import { DiscoveryDApp } from "~Constants"
import { DAppType } from "~Model"

type Props = {
    dapp: DiscoveryDApp
}

export const useDAppTags = ({ dapp }: Props) => {
    const getTag = useCallback(() => {
        const tags = dapp.tags?.map(tag => tag.toLowerCase())

        if (tags?.includes(DAppType.SUSTAINABILTY.toLowerCase())) {
            return DAppType.SUSTAINABILTY
        } else if (tags?.includes(DAppType.NFT.toLowerCase())) {
            return DAppType.NFT
        } else {
            return DAppType.DAPPS
        }
    }, [dapp.tags])
    return { getTag }
}
