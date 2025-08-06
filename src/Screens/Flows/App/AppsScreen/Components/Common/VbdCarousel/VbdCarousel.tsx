import React, { useMemo } from "react"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components"
import { useVeBetterDaoDapps } from "~Hooks"
import { VbdCarouselItem } from "./VbdCarouselItem"
import { VbdCarouselItemSkeleton } from "./VbdCarouselItemSkeleton"

type Props = {
    appIds: string[]
    isLoading?: boolean
}

export const VbdCarousel = ({ appIds, isLoading: propsIsLoading }: Props) => {
    const { data: vbdApps, isLoading: vbdLoading } = useVeBetterDaoDapps(true)

    const isLoading = useMemo(() => propsIsLoading || vbdLoading, [propsIsLoading, vbdLoading])

    const items = useMemo(() => {
        if (isLoading || !vbdApps?.length)
            return appIds.map(
                appId => ({ content: <VbdCarouselItemSkeleton />, name: appId } satisfies CarouselSlideItem),
            )

        return appIds.map(appId => {
            const app = vbdApps?.find(_app => _app.id === appId)
            return {
                content: <VbdCarouselItem app={app!} />,
                name: appId,
            } satisfies CarouselSlideItem
        })
    }, [appIds, isLoading, vbdApps])

    return <FullscreenBaseCarousel padding={16} gap={8} data={items} itemHeight={257} />
}
