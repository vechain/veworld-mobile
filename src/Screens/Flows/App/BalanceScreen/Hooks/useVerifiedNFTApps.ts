import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux"
import { selectFeaturedDapps } from "~Storage/Redux/Selectors"

const VERIFIED_NFT_APPS = [
    "com.thorhead",
    "com.worldofv.marketplace-nft",
    "com.nfbc",
    "org.vechain.marketplace.nfbc",
    "org.vechain.marketplace.solarwise",
    "org.vechain.marketplace.stargate",
]

export const useVerifiedNFTApps = () => {
    const featuredDapps = useAppSelector(selectFeaturedDapps)
    const verifiedNFTApps = useMemo(() => {
        return featuredDapps
            ?.filter(
                dapp =>
                    dapp.tags?.map(tag => tag.toLowerCase()).includes("nft") &&
                    dapp.id &&
                    VERIFIED_NFT_APPS.includes(dapp.id),
            )
            .sort((a, b) => b.name.localeCompare(a.name))
    }, [featuredDapps])

    return verifiedNFTApps
}
