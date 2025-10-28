import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseSkeleton, BaseText, BaseView, Layout, BaseTouchable, BaseIcon } from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { useBottomSheetModal, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useCollectionMetadata } from "./Hooks/useCollectionMetadata"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListHome } from "~Navigation/Stacks/HomeStack"
import { Routes } from "~Navigation/Enums"
import { CollectiblesDetailsCard } from "./Components/CollectiblesDetailsCard"
import { CollectionNftsList } from "./Components/CollectionNftsList"
import { ColorThemeType } from "~Constants"
import { CollectionActionsBottomSheet } from "./BottomSheets/CollectionActionsBottomSheet"
import { ReportCollectionBottomsheet } from "./BottomSheets/ReportCollectionBottomSheet"

export enum CollectiblesViewMode {
    GALLERY = "GALLERY",
    DETAILS = "DETAILS",
}

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.COLLECTIBLES_COLLECTION_DETAILS>

export const CollectibleCollectionDetails: React.FC<Props> = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const { ref: collectionActionsBsRef, onOpen: onOpenCollectionActionsBs } = useBottomSheetModal()
    const {
        ref: reportCollectionBsRef,
        onOpen: onOpenReportCollectionBs,
        onClose: onCloseReportCollectionBs,
    } = useBottomSheetModal()
    const [selectedKey, setSelectedKey] = useState<CollectiblesViewMode>(CollectiblesViewMode.GALLERY)
    const collectionAddress = route.params.collectionAddress

    const handleOpenActionsBottomSheet = useCallback(() => {
        onOpenCollectionActionsBs(collectionAddress)
    }, [onOpenCollectionActionsBs, collectionAddress])

    const handleOpenReportCollectionBottomSheet = useCallback(() => {
        onOpenReportCollectionBs()
    }, [onOpenReportCollectionBs])

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
            headerRightElement={
                <BaseTouchable style={styles.common} onPress={handleOpenActionsBottomSheet}>
                    <BaseIcon name="icon-more-horizontal" size={16} color={theme.colors.actionBottomSheet.text} />
                </BaseTouchable>
            }
            safeAreaTestID="Collection_Details_Screen"
            fixedBody={
                <>
                    <BaseView flex={1} px={16} pt={16}>
                        <BaseTabs
                            keys={viewModes.map(mode => mode.id)}
                            labels={viewModes.map(mode => mode.label)}
                            selectedKey={selectedKey}
                            setSelectedKey={setSelectedKey}
                        />
                        <BaseSpacer height={24} />
                        {selectedKey === CollectiblesViewMode.GALLERY && (
                            <>
                                {renderCountLabel}
                                <CollectionNftsList collectionAddress={collectionAddress} />
                            </>
                        )}
                        {selectedKey === CollectiblesViewMode.DETAILS && (
                            <CollectiblesDetailsCard collectionMetadata={collectionMetadata} />
                        )}
                    </BaseView>
                    <CollectionActionsBottomSheet
                        bsRef={collectionActionsBsRef}
                        onOpenReport={handleOpenReportCollectionBottomSheet}
                    />
                    <ReportCollectionBottomsheet
                        ref={reportCollectionBsRef}
                        collectionAddress={collectionAddress}
                        onClose={onCloseReportCollectionBs}
                    />
                </>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        common: {
            backgroundColor: theme.colors.tabsFooter.background,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            borderRadius: 6,
            paddingVertical: 4,
            paddingHorizontal: 8,
            height: 32,
            width: 32,
            alignItems: "center",
            justifyContent: "center",
        },
    })
