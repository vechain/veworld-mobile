import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useState } from "react"
import { BaseView, BaseSpacer, Layout, BaseText, BaseSkeleton } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { RootStackParamListHome } from "~Navigation/Stacks/HomeStack"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import {
    ChangeCollectionsListView,
    CollectiblesViewMode,
} from "../BalanceScreen/Components/Collectibles/ChangeCollectionsListView"
import { CollectionsScreen } from "./CollectionsScreen"
import { useCollectionMetadata } from "./Hooks/useCollectionMetadata"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.COLLECTIBLES_COLLECTION_DETAILS>

export const CollectionDetailsScreen: React.FC<Props> = ({ route }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const [viewMode, setViewMode] = useState<CollectiblesViewMode>("GALLERY")
    const [nftCount, setNftCount] = useState<number>(0)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { data: collectionMetadata, isLoading: isLoadingCollectionMetadata } = useCollectionMetadata(
        route.params.collectionAddress,
    )

    const isObservedAccount = useMemo(() => {
        return AccountUtils.isObservedAccount(selectedAccount)
    }, [selectedAccount])

    const handleViewChange = useCallback((view: CollectiblesViewMode) => {
        setViewMode(view)
    }, [])

    const handleNftCountChange = useCallback((count: number) => {
        setNftCount(count)
    }, [])

    const collectionName = collectionMetadata?.name || LL.BD_COLLECTION()
    const countLabel = nftCount === 1 ? LL.COMMON_COLLECTIBLE() : LL.COMMON_COLLECTIBLES()

    const renderCountLabel = useMemo(() => {
        if (isLoadingCollectionMetadata)
            return (
                <BaseSkeleton
                    height={22}
                    width={100}
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                />
            )
        return (
            <BaseText typographyFont="bodyMedium">
                {nftCount} {countLabel}
            </BaseText>
        )
    }, [
        nftCount,
        countLabel,
        isLoadingCollectionMetadata,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
    ])

    return (
        <Layout
            title={isLoadingCollectionMetadata ? LL.BD_COLLECTION() : collectionName}
            safeAreaTestID="Collection_Details_Screen"
            fixedBody={
                !isLoadingCollectionMetadata && (
                    <BaseView flex={1} px={16} pt={16}>
                        <ChangeCollectionsListView selectedView={viewMode} onViewChange={handleViewChange} />
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="bodyMedium">{renderCountLabel}</BaseText>
                        <BaseSpacer height={24} />
                        <CollectionsScreen
                            collectionAddress={route.params.collectionAddress}
                            viewMode={viewMode}
                            isObservedAccount={isObservedAccount}
                            onNftCountChange={handleNftCountChange}
                        />
                    </BaseView>
                )
            }
        />
    )
}
