export type FeatureFlags = {
    marketsProxyFeature: {
        enabled: boolean
        url: string
        fallbackUrl: string
    }
}

export const getFeatureFlags = async () => {
    try {
        const req = await fetch("https://vechain.github.io/veworld-feature-flags/mobile-feature-flags.json", {
            method: "GET",
            cache: "no-cache",
        })

        const response: FeatureFlags = await req.json()

        return response
    } catch (e) {
        throw new Error()
    }
}
