import React, { useCallback, useState } from "react"
import { BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
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

export const EcosystemSection = () => {
    const [selectedFilter, setSelectedFilter] = useState(DappTypeV2.ALL)
    const [selectedSort, setSelectedSort] = useState<UseDappsWithPaginationSortKey>("alphabetic_asc")
    const [selectedDapp, setSelectedDapp] = useState<DiscoveryDApp>()

    const { ref: sortBs, onOpen: onOpenSortBs } = useBottomSheetModal()
    const { ref: dappOptionsBs, onOpen: onOpenDappOptionsBs } = useBottomSheetModal()
    const { onDAppPress } = useDAppActions()
    const { dependencyLoading, sortedDapps } = useAppHubDapps({
        filter: selectedFilter,
        kind: "v2",
        sort: selectedSort,
    })

    const openSortApps = useCallback(() => onOpenSortBs(), [onOpenSortBs])
    const onDappOptionsClicked = useCallback(
        (dapp: DiscoveryDApp) => {
            setSelectedDapp(dapp)
            onOpenDappOptionsBs()
        },
        [onOpenDappOptionsBs],
    )

    return (
        <BaseView px={16} gap={16}>
            <TopSection onPress={openSortApps} />
            <FiltersSection selectedFilter={selectedFilter} onPress={setSelectedFilter} />
            <DAppsList
                items={sortedDapps}
                onMorePress={onDappOptionsClicked}
                onOpenDApp={onDAppPress}
                isLoading={dependencyLoading}
            />
            <SortDAppsBottomSheetV2 onSortChange={setSelectedSort} selectedSort={selectedSort} bsRef={sortBs} />
            <DappOptionsBottomSheetV2 bsRef={dappOptionsBs} selectedDapp={selectedDapp} />
        </BaseView>
    )
}
