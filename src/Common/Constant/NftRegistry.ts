import { NETWORK_TYPE } from "~Model"

export const GH_NFT_REGISTRY = (net: NETWORK_TYPE, icon?: string) => {
    if (icon) {
        return `https://vechain.github.io/nft-registry/${icon}`
    }

    switch (net) {
        case NETWORK_TYPE.MAIN:
            return "https://vechain.github.io/nft-registry/main.json"
        case NETWORK_TYPE.TEST:
            return "https://vechain.github.io/nft-registry/test.json"
        default:
            return "https://vechain.github.io/nft-registry/main.json"
    }
}
