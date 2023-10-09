/**
 * WalletConnect V2 URI is based on [eip-1328](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1328.md)
 * uri         = "wc" ":" topic [ "@" version ][ "?" parameters ]
 * topic       = STRING
 * version     = 1*DIGIT
 * parameters  = parameter *( "&" parameter )
 * parameter   = key "=" value
 * key         = STRING
 * value       = STRING
 *
 * Required parameters:
 * symKey (STRING) = symmetric key used for pairing encryption
 * relay-protocol (STRING) = protocol name used for relay
 *
 * @returns boolean
 */

export function isValidURI(providedUri: string): boolean {
    try {
        const uri = new URL(providedUri)

        const protocol = uri.protocol
        const symKey = uri.searchParams.get("symKey")
        const relayProtocol = uri.searchParams.get("relay-protocol")

        return (
            // wc protocol
            protocol === "wc:" &&
            // version 2
            uri.pathname.endsWith("@2") &&
            !!symKey &&
            !!relayProtocol
        )
    } catch (e) {
        return false
    }
}

export function getTopicFromPairUri(uri: string) {
    if (!isValidURI(uri)) throw new Error("Invalid WC URI")

    const uriArray = uri.split(":")
    return uriArray[1].split("@")[0]
}
