import React, { useCallback, useMemo } from "react"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseTouchableBox,
    BaseView,
    FastActionsBar,
    SelectAccountBottomSheet,
} from "~Components"
import { NftScreenHeader } from "./Components"
import {
    AccountWithDevice,
    FastAction,
    NonFungibleTokenCollection,
} from "~Model"
import { isEmpty } from "lodash"
import { NftSkeleton } from "./Components/NftSkeleton"
import { StyleSheet, FlatList, ActivityIndicator } from "react-native"
import {
    useBottomSheetModal,
    usePlatformBottomInsets,
    useThemedStyles,
} from "~Common"
import { NFTView } from "../Components"
import { useFetchCollections } from "./useFetchCollections"
import { useI18nContext } from "~i18n"
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
import { COLORS } from "~Common/Theme"

type NFTListProps = {
    item: NonFungibleTokenCollection
    index: number
}

export const NFTScreen = () => {
    const { calculateBottomInsets } = usePlatformBottomInsets()

    const nav = useNavigation()
    const { LL } = useI18nContext()

    const { fetchMoreCollections, isLoading, collections } =
        useFetchCollections()

    const { styles, theme } = useThemedStyles(baseStyles(calculateBottomInsets))

    const accounts = useAppSelector(selectVisibleAccounts)

    const isShowImportNFTs = useAppSelector(selectCollectionListIsEmpty)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const dispatch = useDispatch()

    const setSelectedAccount = (account: AccountWithDevice) => {
        dispatch(selectAccount({ address: account.address }))
    }

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(({ item, index }: NFTListProps) => {
        return <NFTView item={item} index={index} isCollection />
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

    // TODO -> show button only if there are blacklisted collections or NFTs
    const renderFooterComponent = useMemo(() => {
        return (
            <>
                <BaseSpacer height={36} />
                <BaseTouchableBox
                    action={onGoToBlackListed}
                    children={
                        <>
                            <BaseView
                                w={100}
                                h={100}
                                flexDirection="row"
                                justifyContent="center"
                                alignItems="center">
                                <BaseText typographyFont="bodyBold">
                                    {LL.HIDDEN_COLLECTIONS()}
                                </BaseText>
                                <BaseIcon name="chevron-down" />
                            </BaseView>
                        </>
                    }
                />

                {isLoading ? (
                    <ActivityIndicator style={styles.activityIndicator} />
                ) : (
                    <BaseSpacer height={18} />
                )}
            </>
        )
    }, [LL, isLoading, styles.activityIndicator, onGoToBlackListed])

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.COMMON_IMPORT(),
                action: () => {},
                icon: (
                    <BaseIcon color={theme.colors.text} name="tray-arrow-up" />
                ),
                testID: "importButton",
            },
            {
                name: LL.BTN_SEND(),
                action: () =>
                    nav.navigate(Routes.SELECT_TOKEN_SEND, {
                        initialRoute: Routes.HOME,
                    }),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
            {
                name: LL.COMMON_RECEIVE(),
                action: () => nav.navigate(Routes.SWAP),
                icon: <BaseIcon color={theme.colors.text} name="arrow-down" />,
                testID: "receiveButton",
            },
        ],
        [LL, nav, theme.colors.text],
    )

    const renderListHeaderComponent = useMemo(() => {
        return <FastActionsBar actions={Actions} />
    }, [Actions])

    const renderContent = useMemo(() => {
        if (isLoading && isEmpty(collections)) {
            return <NftSkeleton />
        }

        if (isShowImportNFTs) {
            return (
                <BaseView
                    style={{ marginBottom: calculateBottomInsets }}
                    borderRadius={16}
                    mx={20}
                    bg={COLORS.WHITE}
                    justifyContent="center"
                    alignItems="center">
                    <BaseText pt={16}>{LL.DONT_SEE_NFTS()}</BaseText>

                    <BaseView
                        flexDirection="row"
                        justifyContent="space-evenly"
                        w={100}>
                        <BaseTouchable action={() => {}}>
                            <BaseView
                                my={16}
                                bg={COLORS.LIME_GREEN}
                                justifyContent="center"
                                alignItems="center"
                                borderRadius={16}
                                style={styles.quickNFTActions}>
                                <BaseIcon name="tray-arrow-up" size={38} />
                                <BaseText>{LL.IMPORT_NFT()}</BaseText>
                            </BaseView>
                        </BaseTouchable>

                        <BaseTouchable action={() => {}}>
                            <BaseView
                                my={16}
                                bg={COLORS.LIME_GREEN}
                                justifyContent="center"
                                alignItems="center"
                                borderRadius={16}
                                style={styles.quickNFTActions}>
                                <BaseIcon name="arrow-down" size={38} />
                                <BaseText>{LL.RECEIVE_NFT()}</BaseText>
                            </BaseView>
                        </BaseTouchable>
                    </BaseView>
                </BaseView>
            )
        }

        if (!isEmpty(collections)) {
            return (
                <FlatList
                    data={collections}
                    extraData={collections}
                    contentContainerStyle={styles.listContainer}
                    numColumns={2}
                    keyExtractor={item => String(item.address)}
                    ItemSeparatorComponent={renderSeparator}
                    renderItem={renderNftCollection}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    onEndReachedThreshold={1}
                    onEndReached={fetchMoreCollections}
                    ListHeaderComponent={renderListHeaderComponent}
                    ListHeaderComponentStyle={styles.listheader}
                    ListFooterComponent={renderFooterComponent}
                />
            )
        }
    }, [
        LL,
        calculateBottomInsets,
        collections,
        fetchMoreCollections,
        isLoading,
        isShowImportNFTs,
        renderFooterComponent,
        renderListHeaderComponent,
        renderNftCollection,
        renderSeparator,
        styles.listContainer,
        styles.listheader,
        styles.quickNFTActions,
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

const baseStyles = (calculateBottomInsets: number) => () =>
    StyleSheet.create({
        listContainer: {
            marginHorizontal: 20,
            paddingTop: 24,
            paddingBottom: calculateBottomInsets,
        },
        activityIndicator: {
            marginVertical: 36,
            transform: [{ scale: 1.2 }],
        },
        quickNFTActions: {
            width: 140,
            height: 100,
        },
        listheader: {
            marginBottom: 24,
        },
    })
