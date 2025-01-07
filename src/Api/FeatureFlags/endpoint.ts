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
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
            },
        })

        const response: FeatureFlags = await req.json()

        return response
    } catch (e) {
        throw new Error()
    }
}
