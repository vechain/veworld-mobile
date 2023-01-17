import { VET, VTHO } from "../../constants/Token/TokenConstants"
import { FungibleToken } from "~Model/Token"

/**
 * Is this a token other than VET or VTHO
 * @param token - the token to test
 * @returns boolean representing whether this is an external token
 */
const isExternalToken = (token: FungibleToken): boolean => {
    return token.symbol !== VET.symbol && token.symbol !== VTHO.symbol
}

const isCustomToken = (token: FungibleToken): boolean => {
    return token.custom
}

export default {
    isExternalToken,
    isCustomToken,
}
