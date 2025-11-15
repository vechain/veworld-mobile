import { PaymentProvidersEnum } from "~Screens/Flows/App/BuyScreen/Hooks"

export type FeatureFlags = {
    marketsProxyFeature: {
        enabled: boolean
        url: string
        fallbackUrl: string
    }
    pushNotificationFeature: {
        enabled: boolean
    }
    subdomainClaimFeature: {
        enabled: boolean
    }
    paymentProvidersFeature: {
        [PaymentProvidersEnum.CoinbasePay]: {
            android: boolean
            iOS: boolean
            url: string
        }
        [PaymentProvidersEnum.Transak]: {
            android: boolean
            iOS: boolean
        }
        [PaymentProvidersEnum.Coinify]: {
            android: boolean
            iOS: boolean
        }
    }
    discoveryFeature: {
        bannersAutoplay: boolean
        showStellaPayBanner: boolean
        showStargateBanner: boolean
    }
    forks: {
        GALACTICA: {
            transactions: {
                ledger: boolean
            }
        }
        HAYABUSA: {
            stargate: {
                [genesisId: string]: {
                    /**
                     * Address of the Stargate contract
                     */
                    contract: string
                    /**
                     * Address of the StargateNFT contract
                     */
                    nft?: string
                    /**
                     * Address of the NodeManagement contract (deprecated)
                     */
                    nodeManagement?: string
                    /**
                     * Address of the StargateDelegation contract (deprecated)
                     */
                    delegation?: string
                }
            }
        }
    }
    smartWalletFeature: {
        enabled: boolean
    }
    betterWorldFeature: {
        appsScreen: {
            enabled: boolean
        }
        balanceScreen: {
            enabled: boolean
            collectibles: {
                enabled: boolean
            }
            tokens: {
                enabled: boolean
            }
        }
    }
    notificationCenter: {
        registration: {
            enabled: boolean
        }
    }
}

export const getFeatureFlags = async () => {
    const featureFlagsUrl = __DEV__
        ? "https://vechain.github.io/veworld-feature-flags/dev/mobile-versioned-feature-flags.json"
        : "https://vechain.github.io/veworld-feature-flags/mobile-versioned-feature-flags.json"

    const req = await fetch(featureFlagsUrl, {
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
        },
    })

    const response = await req.json()
    return response
}
