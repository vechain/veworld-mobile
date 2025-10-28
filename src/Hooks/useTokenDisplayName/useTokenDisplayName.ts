import { useMemo } from "react"
import { FungibleToken } from "~Model"

export const useTokenDisplayName = (token: FungibleToken) => {
    return useMemo(() => {
        switch (token.symbol) {
            case "VET":
                return "VeChain"
            case "VTHO":
                return "VeThor"
            case "B3TR":
                return "VeBetter"
            case "VOT3":
                return "VeBetter"
            default:
                return token.name
        }
    }, [token.name, token.symbol])
}
