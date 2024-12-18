import React, { useCallback, useMemo, useState } from "react"
import { useBottomSheetModal, useScrollableList, useTheme } from "~Hooks"
import { BaseCard, BaseSpacer, BaseText, BaseView, Layout, QRCodeBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
import { FlatList, RefreshControl, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { CustomTokenBox, NoTokensButton, SkeletonCustomTokenBox } from "./Components"
import { AddCustomTokenBottomSheet } from "./BottomSheets"
import { useTokensOwned } from "./Hooks"
import { FungibleToken } from "~Model"

// Number of Skeleton Token boxes to show when fetching first page of custom tokens owned.
const SKELETON_COUNT = 12

export const ManageCustomTokenScreen = () => {
    // Pull down to refresh
    const [refreshing, setRefreshing] = useState(false)

    // To prevent fetching next page of activities on FlashList mount
    const [hasScrolled, setHasScrolled] = useState(false)

    // Address of the custom token the user wants to add to the home screen.
    const [customToken, setCustomToken] = useState<FungibleToken>()

    const theme = useTheme()

    const { LL } = useI18nContext()

    const { tokens, hasFetched, page, setPage, fetchTokens } = useTokensOwned()

    // 1 and 2 are to simulate snapIndex fully expanded.
    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } = useScrollableList(tokens, 1, 2)

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()

    const onAddCustomToken = useCallback(
        (token: FungibleToken) => {
            setCustomToken(token)

            openAddCustomTokenSheet()
        },
        [openAddCustomTokenSheet],
    )

    const onScroll = useCallback(() => {
        setHasScrolled(true)
    }, [])

    const onEndReached = useCallback(async () => {
        if (hasScrolled) {
            await fetchTokens()
        }
    }, [fetchTokens, hasScrolled])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        setHasScrolled(false)
        setPage(0)

        setRefreshing(false)
    }, [setPage])

    const tokensListSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderCustomTokensList = useMemo(() => {
        return (
            <>
                <BaseView flexDirection="row" style={[styles.list]}>
                    <FlashList
                        data={tokens}
                        keyExtractor={token => token.tokenAddress}
                        ItemSeparatorComponent={tokensListSeparator}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        scrollEnabled={isListScrollable}
                        ListHeaderComponent={<BaseSpacer height={8} />}
                        ListFooterComponent={
                            hasFetched ? (
                                <BaseSpacer height={20} />
                            ) : (
                                <BaseView mx={20} pt={8}>
                                    <BaseCard
                                        style={styles.skeletonContainer}
                                        containerStyle={styles.skeletonCardContainer}>
                                        <SkeletonCustomTokenBox />
                                    </BaseCard>
                                </BaseView>
                            )
                        }
                        renderItem={({ item: token }) => {
                            const tokenId = `${token.tokenAddress}`

                            return (
                                <BaseView mx={20} testID={tokenId}>
                                    <CustomTokenBox tokenBalance={token} onTogglePress={onAddCustomToken} />
                                </BaseView>
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        estimatedItemSize={80}
                        estimatedListSize={{
                            height: 80 * tokens.length,
                            width: 400,
                        }}
                        onScroll={onScroll}
                        onEndReachedThreshold={0.5}
                        onEndReached={onEndReached}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={theme.colors.border}
                            />
                        }
                        testID="contacts-list"
                    />
                </BaseView>
            </>
        )
    }, [
        hasFetched,
        isListScrollable,
        onAddCustomToken,
        onEndReached,
        onRefresh,
        onScroll,
        onViewableItemsChanged,
        refreshing,
        theme.colors.border,
        tokens,
        tokensListSeparator,
        viewabilityConfig,
    ])

    const renderSkeletonList = useMemo(() => {
        return (
            <>
                <BaseView flexDirection="row" style={styles.list}>
                    <FlatList
                        data={[...Array(SKELETON_COUNT)]}
                        keyExtractor={(_, index) => `skeleton-${index}`}
                        ListFooterComponent={<BaseSpacer height={20} />}
                        renderItem={() => {
                            return (
                                <BaseView mx={20}>
                                    <BaseCard
                                        style={styles.skeletonContainer}
                                        containerStyle={styles.skeletonCardContainer}>
                                        <SkeletonCustomTokenBox />
                                    </BaseCard>
                                </BaseView>
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />
                </BaseView>
            </>
        )
    }, [])

    const renderNoTokensButton = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={styles.noTokensButton}>
                <NoTokensButton onPress={openQRCodeSheet} />
            </BaseView>
        )
    }, [openQRCodeSheet])

    return (
        <Layout
            safeAreaTestID="History_Screen"
            title={LL.MANAGE_TOKEN_TITLE_YOUR_TOKENS()}
            fixedHeader={
                <>
                    <BaseText typographyFont="bodyMedium" pt={26}>
                        {LL.MANAGE_TOKEN_ADD_CUSTOM_TOKNE_SUBTITLE()}
                    </BaseText>
                </>
            }
            fixedBody={
                <>
                    {/* Tokens List */}
                    {!!tokens.length && (page !== 0 || hasFetched) && renderCustomTokensList}

                    {/* Fetching Tokens shows skeleton */}
                    {!hasFetched && page === 0 && renderSkeletonList}

                    {/* No Tokens owned */}
                    {!tokens.length && hasFetched && renderNoTokensButton}

                    <AddCustomTokenBottomSheet
                        ref={addCustomTokenSheetRef}
                        onClose={closeAddCustomTokenSheet}
                        token={customToken}
                    />

                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                </>
            }
        />
    )
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 20,
        marginVertical: 8,
    },
    underlayContainer: {
        flexDirection: "row",
    },
    list: {
        top: 0,
        flex: 1,
    },
    noTokensButton: {
        position: "absolute",
        bottom: "50%",
    },
    skeletonCardContainer: {
        marginVertical: 8,
    },
    skeletonContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
})
