/**
 * Validate IPFS URI strings. An example of a valid IPFS URI is:
 * - ipfs://QmfSTia1TJUiKQ2fyW9NTPzEKNdjMGzbUgrC3QPSTpkum6/406.json
 * - ipfs://QmVPqKfwRXjg5Fqwy6RNRbKR2ZP4pKKVLvmfjmhQfdM3MH/4
 * - ipfs://QmVPqKfwRXjg5Fqwy6RNRbKR2ZP4pKKVLvmfjmhQfdM3MH
 * @param uri
 * @returns
 */
export const validateIpfsUri = (uri: string): boolean => {
    const trimmedUri = uri.trim()
    return /^ipfs:\/\/Qm[a-zA-Z0-9]+(\/[^/]+)*\/?$/.test(trimmedUri)
}
