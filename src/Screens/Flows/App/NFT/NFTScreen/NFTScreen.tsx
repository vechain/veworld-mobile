import React, { useCallback, useMemo, useState } from "react"
import {
    BaseView,
    Layout,
    QRCodeBottomSheet,
    SelectAccountBottomSheet,
} from "~Components"
import { NftScreenHeader } from "./Components"
import { AccountWithDevice } from "~Model"
import { isEmpty } from "lodash"
import { NftLoader } from "./Components/NftLoader"
import { useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import { useFetchCollections } from "./useFetchCollections"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    selectBlackListedCollections,
    selectCollectionListIsEmpty,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { ImportNFTView } from "./Components/ImportNFTView"
import { NetworkErrorView } from "./Components/NetworkErrorView"
import { NFTList } from "./Components/NFTList"
import { useNFTRegistry } from "~Hooks/useNft/useNFTRegistry"

export const NFTScreen = () => {
    const nav = useNavigation()
    useNFTRegistry()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const [
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    ] = useState(true)

    const { fetchMoreCollections, isLoading, collections, error, hasNext } =
        useFetchCollections(
            onEndReachedCalledDuringMomentum,
            setEndReachedCalledDuringMomentum,
        )

    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const accounts = useAppSelector(selectVisibleAccounts)

    const isShowImportNFTs = useAppSelector(selectCollectionListIsEmpty)

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(true)
    }, [])

    const onGoToBlackListed = useCallback(
        () => nav.navigate(Routes.BLACKLISTED_COLLECTIONS),
        [nav],
    )

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } =
        useBottomSheetModal()

    const renderImportNftView = useMemo(() => {
        if (isShowImportNFTs)
            return <ImportNFTView onImportPress={openQRCodeSheet} />
    }, [isShowImportNFTs, openQRCodeSheet])

    const renderNFTList = useMemo(() => {
        if (!isEmpty(collections) || !isEmpty(blackListedCollections))
            return (
                <NFTList
                    collections={collections}
                    isLoading={isLoading}
                    onGoToBlackListed={onGoToBlackListed}
                    fetchMoreCollections={fetchMoreCollections}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    hasNext={hasNext}
                />
            )
    }, [
        collections,
        blackListedCollections,
        isLoading,
        onGoToBlackListed,
        fetchMoreCollections,
        onMomentumScrollBegin,
        hasNext,
    ])

    const renderContent = useMemo(() => {
        if (!isEmpty(error) && isEmpty(collections)) return <NetworkErrorView />

        return (
            <NftLoader isLoading={isLoading && isEmpty(collections)}>
                {renderImportNftView}
                {renderNFTList}
            </NftLoader>
        )
    }, [error, collections, isLoading, renderImportNftView, renderNFTList])

    return (
        <Layout
            safeAreaTestID="NFT_Screen"
            fixedHeader={
                <NftScreenHeader
                    openSelectAccountBottomSheet={openSelectAccountBottomSheet}
                />
            }
            bodyWithoutScrollView={
                <>
                    <BaseView flex={1} justifyContent="center">
                        {renderContent}
                    </BaseView>
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={setSelectedAccount}
                        selectedAccount={selectedAccount}
                        ref={selectAccountBottomSheetRef}
                    />

                    {/* BOTTOM SHEETS */}
                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                </>
            }
            noBackButton
        />
    )
}
