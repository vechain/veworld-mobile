import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { RefObject, useCallback, useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { UseDappsWithPaginationSortKey } from "~Hooks/useDappsWithPagination"
import { useAppHubDapps } from "~Hooks/useDappsWithPagination/useAppHubDapps"
import { Routes } from "~Navigation"
import { useDAppActions } from "../../Hooks"
import { DappOptionsBottomSheetV2 } from "./DappOptionsBottomSheetV2"
import { DAppsList } from "./DappsList"
import { FiltersSection } from "./FiltersSection"
import { SortDAppsBottomSheetV2 } from "./SortDAppsBottomSheetV2"
import { TopSection } from "./TopSection"
import { DappTypeV2 } from "./types"

export const EcosystemSection = ({
    defaultFilter,
    scrollViewRef,
}: {
    defaultFilter?: DappTypeV2
    scrollViewRef: RefObject<ScrollView | null>
}) => {
    const [selectedFilter, setSelectedFilter] = useState(defaultFilter ?? DappTypeV2.ALL)
    const [selectedSort, setSelectedSort] = useState<UseDappsWithPaginationSortKey>("alphabetic_asc")
    const [animationDirection, setAnimationDirection] = useState<"left" | "right" | null>(null)
    const [isProcessingAll, setIsProcessingAll] = useState(false)
    const [y, setY] = useState(0)

    const { styles } = useThemedStyles(baseStyles)

    const containerRef = useRef<View>(null)

    const selectedFilterRef = useRef(selectedFilter)

    const { ref: sortBs, onOpen: onOpenSortBs } = useBottomSheetModal()
    const { ref: dappOptionsBs, onOpen: onOpenDappOptionsBs } = useBottomSheetModal()
    const { onDAppPress } = useDAppActions(Routes.APPS)
    const { dependencyLoading, sortedDapps } = useAppHubDapps({
        filter: selectedFilter,
        kind: "v2",
        sort: selectedSort,
    })

    const navigation = useNavigation()

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

    useFocusEffect(
        useCallback(() => {
            if (defaultFilter) {
                scrollViewRef.current?.scrollTo({ y })
                setSelectedFilter(defaultFilter)
                navigation.setParams({ filter: undefined })
            }
        }, [defaultFilter, navigation, scrollViewRef, y]),
    )

    return (
        <View
            style={styles.root}
            ref={containerRef}
            onLayout={e => {
                setY(e.nativeEvent.layout.y)
            }}>
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
        </View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            gap: 16,
            paddingHorizontal: 16,
        },
    })
