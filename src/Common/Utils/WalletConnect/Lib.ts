/**
 * Types
 */
export type TVechainChain = keyof typeof VECHAIN_CHAINS

/**
 * Chains
 */
export const VECHAIN_MAINNET_CHAINS = {
    "vechain:100009": {
        chainId: 100009,
        name: "Vechain Mainnet",
        logo: "/chain-logos/eip155-1.png",
        rgb: "99, 125, 234",
        rpc: "https://cloudflare-eth.com/",
    },
}

export const VECHAIN_TESTNET_CHAINS = {
    "vechain:100010": {
        chainId: 100010,
        name: "Vechain Testnet",
        logo: "/chain-logos/eip155-1.png",
        rgb: "99, 125, 234",
        rpc: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
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
    PERSONAL_SIGN: "personal_sign",
    ETH_SIGN: "eth_sign",
    ETH_SIGN_TRANSACTION: "eth_signTransaction",
    ETH_SIGN_TYPED_DATA: "eth_signTypedData",
    ETH_SIGN_TYPED_DATA_V3: "eth_signTypedData_v3",
    ETH_SIGN_TYPED_DATA_V4: "eth_signTypedData_v4",
    ETH_SEND_RAW_TRANSACTION: "eth_sendRawTransaction",
    ETH_SEND_TRANSACTION: "eth_sendTransaction",
}
