import React, { useCallback, useMemo, useState } from "react"
import { BaseSafeArea, BaseView, SelectAccountBottomSheet } from "~Components"
import { NftScreenHeader } from "./Components"
import { AccountWithDevice } from "~Model"
import { isEmpty } from "lodash"
import { NftSkeleton } from "./Components/NftSkeleton"
import { useBottomSheetModal } from "~Hooks"
import { useFetchCollections } from "./useFetchCollections"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import {
    selectAccount,
    selectCollectionListIsEmpty,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { useDispatch } from "react-redux"
import { ImportNFTView } from "./Components/ImportNFTView"
import { NetworkErrorView } from "./Components/NetworkErrorView"
import { NFTLIst } from "./Components/NFTLIst"

export const NFTScreen = () => {
    const nav = useNavigation()

    const [
        onEndReachedCalledDuringMomentum,
        setEndReachedCalledDuringMomentum,
    ] = useState(true)

    const { fetchMoreCollections, isLoading, collections, error, hasNext } =
        useFetchCollections(
            onEndReachedCalledDuringMomentum,
            setEndReachedCalledDuringMomentum,
        )

    const accounts = useAppSelector(selectVisibleAccounts)

    const isShowImportNFTs = useAppSelector(selectCollectionListIsEmpty)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const dispatch = useDispatch()

    const setSelectedAccount = (account: AccountWithDevice) => {
        dispatch(selectAccount({ address: account.address }))
    }

    const onMomentumScrollBegin = useCallback(() => {
        setEndReachedCalledDuringMomentum(false)
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

    const renderContent = useMemo(() => {
        if (!isEmpty(error) && isEmpty(collections)) return <NetworkErrorView />

        if (isLoading && isEmpty(collections)) return <NftSkeleton />

        if (isShowImportNFTs) return <ImportNFTView />

        if (!isEmpty(collections)) {
            return (
                <NFTLIst
                    collections={collections}
                    isLoading={isLoading}
                    onGoToBlackListed={onGoToBlackListed}
                    fetchMoreCollections={fetchMoreCollections}
                    onMomentumScrollBegin={onMomentumScrollBegin}
                    hasNext={hasNext}
                />
            )
        }
    }, [
        collections,
        hasNext,
        error,
        fetchMoreCollections,
        isLoading,
        isShowImportNFTs,
        onGoToBlackListed,
        onMomentumScrollBegin,
    ])

    return (
        <BaseSafeArea grow={1} testID="NFT_Screen">
            <NftScreenHeader
                openSelectAccountBottomSheet={openSelectAccountBottomSheet}
            />

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
        </BaseSafeArea>
    )
}
