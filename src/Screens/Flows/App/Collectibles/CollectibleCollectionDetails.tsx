import React, { useMemo, useState } from "react"
import { BaseSpacer, BaseSkeleton, BaseText, BaseView, Layout } from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useCollectionMetadata } from "./Hooks/useCollectionMetadata"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListHome } from "~Navigation/Stacks/HomeStack"
import { Routes } from "~Navigation/Enums"
import { CollectiblesDetailsCard } from "./Components/CollectiblesDetailsCard"
import { CollectionNftsList } from "./Components/CollectionNftsList"

export enum CollectiblesViewMode {
    GALLERY = "GALLERY",
    DETAILS = "DETAILS",
}

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.COLLECTIBLES_COLLECTION_DETAILS>

export const CollectibleCollectionDetails: React.FC<Props> = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const [selectedKey, setSelectedKey] = useState<CollectiblesViewMode>(CollectiblesViewMode.GALLERY)
    const collectionAddress = route.params.collectionAddress
    const { data: collectionMetadata, isLoading: isLoadingCollectionMetadata } =
        useCollectionMetadata(collectionAddress)

    const viewModes: Array<{ id: CollectiblesViewMode; label: string }> = useMemo(
        () => [
            {
                id: CollectiblesViewMode.GALLERY,
                label: LL.COLLECTIBLES_VIEW_GALLERY(),
            },
            {
                id: CollectiblesViewMode.DETAILS,
                label: LL.COLLECTIBLES_VIEW_DETAILS(),
            },
        ],
        [LL],
    )

    const renderCountLabel = useMemo(() => {
        if (isLoadingCollectionMetadata)
            return (
                <>
                    <BaseSkeleton
                        height={22}
                        width={100}
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                    />
                    <BaseSpacer height={24} />
                </>
            )

        if (collectionMetadata?.balanceOf && collectionMetadata.balanceOf <= 1)
            return (
                <>
                    <BaseText typographyFont="bodyMedium">
                        {collectionMetadata?.balanceOf} {LL.SB_COLLECTIBLE()}
                    </BaseText>
                    <BaseSpacer height={24} />
                </>
            )

        return (
            <>
                <BaseText typographyFont="bodyMedium">
                    {collectionMetadata?.balanceOf} {LL.SB_COLLECTIBLES()}
                </BaseText>
                <BaseSpacer height={24} />
            </>
        )
    }, [
        isLoadingCollectionMetadata,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        collectionMetadata?.balanceOf,
        LL,
    ])

    return (
        <Layout
            title={collectionMetadata?.name}
            safeAreaTestID="Collection_Details_Screen"
            fixedBody={
                <BaseView flex={1} px={16} pt={16}>
                    <BaseTabs
                        keys={viewModes.map(mode => mode.id)}
                        labels={viewModes.map(mode => mode.label)}
                        selectedKey={selectedKey}
                        setSelectedKey={setSelectedKey}
                    />
                    <BaseSpacer height={24} />
                    {selectedKey !== CollectiblesViewMode.DETAILS && renderCountLabel}
                    {selectedKey === CollectiblesViewMode.GALLERY && (
                        <CollectionNftsList collectionAddress={collectionAddress} />
                    )}
                    {selectedKey === CollectiblesViewMode.DETAILS && (
                        <CollectiblesDetailsCard collectionMetadata={collectionMetadata} />
                    )}
                </BaseView>
            }
        />
    )
}
