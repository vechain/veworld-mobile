import { PersistedState } from "redux-persist/es/types"
import { TokensState } from "../Types"
import { FungibleToken } from "~Model"

const safeParseInt = (value: string, defaultValue: number) => {
    try {
        const parsed = parseInt(value, 10)
        if (isNaN(parsed)) return defaultValue
        return parsed
    } catch {
        return defaultValue
    }
}

const mapFungibleToken = (tk: FungibleToken) => ({
    ...tk,
    decimals: typeof tk.decimals === "string" ? safeParseInt(tk.decimals, 18) : tk.decimals,
})

const mapCustomTokens = (customTokens: Record<string, FungibleToken[]>) =>
    Object.entries(customTokens).map(([address, tokens]) => [address, tokens.map(mapFungibleToken)])

export const Migration17 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: TokensState = state.tokens

    const newState: TokensState = {
        ...currentState,
        tokens: Object.fromEntries(
            Object.entries(currentState.tokens).map(([network, value]) => {
                const customTokens = value.custom ?? {}

                return [network, { ...value, custom: Object.fromEntries(mapCustomTokens(customTokens)) }]
            }),
        ) as TokensState["tokens"],
    }

    return {
        ...state,
        tokens: newState,
    } as PersistedState
}
