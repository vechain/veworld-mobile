import { ThorClient } from "@vechain/sdk-network"
import { ethers } from "ethers"
import { VetDomains } from "~Constants/Constants/Thor/abis"
import { parseAvatarRecord } from "./accountParser"
import { defaultMainNetwork, defaultTestNetwork, ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils/Logger"

/**
 * Get avatar for a VET domain
 * @param domain - The VET domain name to get avatar for
 * @param options - Options
 * @returns Promise<string | null> - The avatar URL or null if not found
 */
export const getAvatar = async (
    domain: string,
    options: { thor: ThorClient; vetDomainsAddress: string; genesisId: string },
): Promise<string | null> => {
    if (!domain) return null
    if (ethers.utils.isAddress(domain)) {
        throw new Error("getAvatar expects a domain name, not an address")
    }

    try {
        // Get avatar record from contract
        const avatarRecord = await fetchAvatarFromContract(domain, options.thor, options.vetDomainsAddress)

        if (!avatarRecord) return null

        // Parse the avatar record and return ready-to-use data
        const parsedAvatar = await parseAvatarRecord(avatarRecord, { genesisId: options.genesisId, thor: options.thor })

        return parsedAvatar
    } catch (error) {
        debug(ERROR_EVENTS.PROFILE, "[getAvatar]: Error while reading avatar.")
        return null
    }
}

// Fetch avatar from contract
const fetchAvatarFromContract = async (
    _domain: string,
    client: ThorClient,
    vetDomainsAddress: string,
): Promise<string | null> => {
    // Get resolver address
    const node = ethers.utils.namehash(_domain) as `0x${string}`
    const resolverAddressTxResult = await client.contracts
        .load(vetDomainsAddress, [VetDomains.resolver])
        .read.resolver(node)

    const resolverAddress = resolverAddressTxResult[0]

    if (!resolverAddress || resolverAddress === ethers.constants.AddressZero) return null

    const avatarTxResult = await client.contracts.load(resolverAddress, [VetDomains.text]).read.text(node, "avatar")

    return avatarTxResult[0] || null
}

/**
 * Get the VET Domains Registry address
 * @param genesisId Genesis id of the network
 * @returns The VET Domains Registry address or null if the network isn't valid
 */
export const getVetDomainsRegistryAddress = (genesisId: string) => {
    switch (genesisId) {
        case defaultMainNetwork.genesis.id:
            return "0xa9231da8BF8D10e2df3f6E03Dd5449caD600129b"
        case defaultTestNetwork.genesis.id:
            return "0xcBFB30c1F267914816668d53AcBA7bA7c9806D13"
        default:
            return null
    }
}
