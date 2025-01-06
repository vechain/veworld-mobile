import { FungibleToken, Network } from "~Model"
import { defaultMainNetwork } from "../Thor/ThorConstants"
import { B3trTokenIcon, VetTokenIcon, VthoTokenIcon } from "~Assets"

export const getDefaultSelectedNetwork = (): Network => {
    return defaultMainNetwork
}

export const VET: FungibleToken = {
    name: "Vechain",
    symbol: "VET",
    address: "0x0",
    decimals: 18,
    custom: false,
    icon: VetTokenIcon,
}

export const VTHO: FungibleToken = {
    symbol: "VTHO",
    name: "Vethor",
    address: "0x0000000000000000000000000000456e65726779",
    decimals: 18,
    custom: false,
    icon: VthoTokenIcon,
}

export const B3TR: FungibleToken = {
    symbol: "B3TR",
    name: "B3TR",
    address: "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
    decimals: 18,
    custom: false,
    icon: B3trTokenIcon,
}

export const VOT3: FungibleToken = {
    symbol: "VOT3",
    name: "VOT3",
    address: "0x76Ca782B59C74d088C7D2Cce2f211BC00836c602",
    decimals: 18,
    custom: false,
    icon: B3trTokenIcon,
}
