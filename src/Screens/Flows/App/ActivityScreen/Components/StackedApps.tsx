import React, { useMemo } from "react"
import { StackedImages } from "~Components/Reusable/StackedImages"
import { useVeBetterDaoDapps } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { B3trXAllocationVoteActivity } from "~Model"
import { MathUtils } from "~Utils"

export const StackedApps = ({ appVotes, roundId }: Pick<B3trXAllocationVoteActivity, "appVotes" | "roundId">) => {
    const { data: vbdApps } = useVeBetterDaoDapps()
    const fetchDynamicLogo = useDynamicAppLogo({ size: 32 })
    const shownApps = useMemo(() => {
        if (appVotes.length <= 3) return appVotes
        const randomFn = MathUtils.deterministicRNG(parseInt(roundId, 10))
        return appVotes
            .map(vote => ({ ...vote, randomValue: randomFn() }))
            .sort((a, b) => a.randomValue - b.randomValue)
    }, [appVotes, roundId])

    const appLogoUris = useMemo(() => {
        return shownApps
            .map(app => vbdApps?.find(vbdApp => vbdApp.id === app.appId))
            .filter((app): app is NonNullable<typeof app> => Boolean(app))
            .map(app => fetchDynamicLogo({ app }))
    }, [fetchDynamicLogo, shownApps, vbdApps])

    return <StackedImages uris={appLogoUris} maxImagesBeforeCompression={3} />
}
