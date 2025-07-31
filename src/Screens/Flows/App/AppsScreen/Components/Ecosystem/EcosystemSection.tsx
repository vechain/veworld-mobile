import React, { useCallback, useState } from "react"
import { BaseView } from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { useAppHubDapps } from "~Hooks/useDappsWithPagination/useAppHubDapps"
import { useDAppActions } from "~Screens/Flows/App/DiscoverScreen/Hooks"
import { DAppsList } from "./DappsList"
import { FiltersSection } from "./FiltersSection"
import { TopSection } from "./TopSection"
import { DappTypeV2 } from "./types"

export const EcosystemSection = () => {
    const [selectedFilter, setSelectedFilter] = useState(DappTypeV2.ALL)

    const { onOpen: onOpenSortBs } = useBottomSheetModal()
    const { onOpen: onOpenDappOptionsBs } = useBottomSheetModal()
    const { onDAppPress } = useDAppActions()
    const { dependencyLoading } = useAppHubDapps({ filter: selectedFilter, kind: "v2" })

    const openSortApps = useCallback(() => onOpenSortBs(), [onOpenSortBs])

    return (
        <BaseView px={16} gap={16}>
            <TopSection onPress={openSortApps} />
            <FiltersSection selectedFilter={selectedFilter} onPress={setSelectedFilter} />
            <DAppsList
                items={[]}
                onMorePress={onOpenDappOptionsBs}
                onOpenDApp={onDAppPress}
                isLoading={dependencyLoading}
            />
        </BaseView>
    )
}
