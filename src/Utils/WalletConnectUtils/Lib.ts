/**
 * Types
 */
export type TVechainChain = keyof typeof VECHAIN_CHAINS

/**
 * Chains
 */
export const VECHAIN_MAINNET_CHAINS = {
    "vechain:main": {
        chainId: 100009,
        name: "Vechain Mainnet",
        logo: "/chain-logos/eip155-1.png",
        rgb: "99, 125, 234",
    },
}

export const VECHAIN_TESTNET_CHAINS = {
    "vechain:test": {
        chainId: 100010,
        name: "Vechain Testnet",
        logo: "/chain-logos/eip155-1.png",
        rgb: "99, 125, 234",
    },
}

export const VECHAIN_CHAINS = {
    ...VECHAIN_MAINNET_CHAINS,
    ...VECHAIN_TESTNET_CHAINS,
}

/**
 * Methods
 */
export const VECHAIN_SIGNING_METHODS = {
    IDENTIFY: "identify",
    REQUEST_TRANSACTION: "request_transaction",
}
