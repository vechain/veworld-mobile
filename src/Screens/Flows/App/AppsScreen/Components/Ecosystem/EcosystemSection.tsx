import React, { useCallback, useEffect, useRef, useState } from "react"
import { BaseView } from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { UseDappsWithPaginationSortKey } from "~Hooks/useDappsWithPagination"
import { useAppHubDapps } from "~Hooks/useDappsWithPagination/useAppHubDapps"
import { useDAppActions } from "~Screens/Flows/App/DiscoverScreen/Hooks"
import { DappOptionsBottomSheetV2 } from "./DappOptionsBottomSheetV2"
import { DAppsList } from "./DappsList"
import { FiltersSection } from "./FiltersSection"
import { SortDAppsBottomSheetV2 } from "./SortDAppsBottomSheetV2"
import { TopSection } from "./TopSection"
import { DappTypeV2 } from "./types"
import { Routes } from "~Navigation"

export const EcosystemSection = () => {
    const [selectedFilter, setSelectedFilter] = useState(DappTypeV2.ALL)
    const [selectedSort, setSelectedSort] = useState<UseDappsWithPaginationSortKey>("alphabetic_asc")
    const [animationDirection, setAnimationDirection] = useState<"left" | "right" | null>(null)
    const [isProcessingAll, setIsProcessingAll] = useState(false)

    const selectedFilterRef = useRef(selectedFilter)

    const { ref: sortBs, onOpen: onOpenSortBs } = useBottomSheetModal()
    const { ref: dappOptionsBs, onOpen: onOpenDappOptionsBs } = useBottomSheetModal()
    const { onDAppPress } = useDAppActions(Routes.APPS)
    const { dependencyLoading, sortedDapps } = useAppHubDapps({
        filter: selectedFilter,
        kind: "v2",
        sort: selectedSort,
    })

    useEffect(() => {
        selectedFilterRef.current = selectedFilter
    }, [selectedFilter])

    const handleFilterChange = useCallback(
        (newFilter: DappTypeV2) => {
            if (newFilter === selectedFilterRef.current || animationDirection) return

            const filters = Object.values(DappTypeV2)
            const currentIndex = filters.indexOf(selectedFilterRef.current)
            const newIndex = filters.indexOf(newFilter)

            if (newIndex > currentIndex) {
                setAnimationDirection("left")
            } else if (newIndex < currentIndex) {
                setAnimationDirection("right")
            } else {
                setAnimationDirection(null)
            }

            setSelectedFilter(newFilter)

            const isAllFilter = newFilter === DappTypeV2.ALL
            if (isAllFilter) {
                setIsProcessingAll(true)
            }
        },
        [animationDirection],
    )

    const handleAnimationComplete = useCallback(() => {
        setAnimationDirection(null)
        if (selectedFilterRef.current === DappTypeV2.ALL) {
            setIsProcessingAll(false)
        }
    }, [])

    useEffect(() => {
        return () => {
            if (animationDirection) {
                setAnimationDirection(null)
                setIsProcessingAll(false)
            }
        }
    }, [animationDirection])

    const openSortApps = useCallback(() => onOpenSortBs(), [onOpenSortBs])

    return (
        <BaseView gap={16} px={16}>
            <TopSection onPress={openSortApps} />
            <FiltersSection selectedFilter={selectedFilter} onPress={handleFilterChange} />
            <DAppsList
                items={sortedDapps}
                onMorePress={onOpenDappOptionsBs}
                onOpenDApp={onDAppPress}
                isLoading={dependencyLoading || isProcessingAll}
                animationDirection={animationDirection}
                onAnimationComplete={handleAnimationComplete}
            />
            <SortDAppsBottomSheetV2 onSortChange={setSelectedSort} selectedSort={selectedSort} bsRef={sortBs} />
            <DappOptionsBottomSheetV2 bsRef={dappOptionsBs} />
        </BaseView>
    )
}
