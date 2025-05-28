import { PersistedState } from "redux-persist/es/types"
import { TokensState } from "../Types"

const safeParseInt = (value: string, defaultValue: number) => {
    try {
        const parsed = parseInt(value, 10)
        if (isNaN(parsed)) return defaultValue
        return parsed
    } catch (e) {
        return defaultValue
    }
}

export const Migration17 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: TokensState = state.tokens

    const newState: TokensState = {
        ...currentState,
        tokens: Object.fromEntries(
            Object.entries(currentState.tokens).map(([network, value]) => {
                const customTokens = value.custom ?? {}

                const mappedCustomTokens = Object.entries(customTokens).map(([address, tokens]) => [
                    address,
                    tokens.map(tk => ({
                        ...tk,
                        decimals: typeof tk.decimals === "string" ? safeParseInt(tk.decimals, 18) : tk.decimals,
                    })),
                ])

                return [network, { ...value, custom: Object.fromEntries(mappedCustomTokens) }]
            }),
        ) as TokensState["tokens"],
    }

    return {
        ...state,
        tokens: newState,
    } as PersistedState
}
