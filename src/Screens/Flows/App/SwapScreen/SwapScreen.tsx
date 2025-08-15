import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    ChangeAccountButtonPill,
    Layout,
    ListEmptyResults,
    SelectAccountBottomSheet,
} from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount, useThemedStyles } from "~Hooks"
import { useFetchFeaturedDApps } from "~Hooks/useFetchFeaturedDApps"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    addNavigationToDApp,
    selectBookmarkedDapps,
    selectSelectedAccount,
    selectSwapFeaturedDapps,
    selectVisibleAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { ListSkeleton, SwapDAppCard } from "./components"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SWAP>

export const SwapScreen = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation<NavigationProps>()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const accounts = useAppSelector(selectVisibleAccounts)
    const swappDApps = useAppSelector(selectSwapFeaturedDapps)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { isFetching } = useFetchFeaturedDApps()

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const dAppsToShow = useMemo(() => {
        const swapDAppsBookmarked: DiscoveryDApp[] = []
        const swapDAppsNotBookmarked: DiscoveryDApp[] = []

        swappDApps.forEach(dapp => {
            if (bookmarkedDApps.find(b => b.name === dapp.name)) {
                swapDAppsBookmarked.push(dapp)
            } else {
                swapDAppsNotBookmarked.push(dapp)
            }
        })

        swapDAppsBookmarked.sort((a, b) => a.name.localeCompare(b.name))
        swapDAppsNotBookmarked.sort((a, b) => a.name.localeCompare(b.name))
        return [...swapDAppsBookmarked, ...swapDAppsNotBookmarked]
    }, [bookmarkedDApps, swappDApps])

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            track(AnalyticsEvent.SWAPP_USER_OPENED_DAPP, {
                url: href,
            })
            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [nav, track, dispatch],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={12} />, [])
    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return <SwapDAppCard dapp={item} onDAppPress={onDAppPress} />
        },
        [onDAppPress],
    )

    return (
        <Layout
            safeAreaTestID="Swap_Screen"
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            title={LL.SWAP_TITLE()}
            headerRightElement={<ChangeAccountButtonPill action={openSelectAccountBottomSheet} />}
            fixedBody={
                <BaseView flex={1}>
                    <BaseView px={16}>
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="body">{LL.SWAP_DESCRIPTION()}</BaseText>
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="bodyMedium">
                            {LL.SWAP_DAPP_NUMBER({ total: dAppsToShow.length })}
                        </BaseText>
                        <BaseSpacer height={16} />
                    </BaseView>

                    {isFetching ? (
                        <ListSkeleton />
                    ) : (
                        <FlatList
                            contentContainerStyle={styles.listContentContainer}
                            data={dAppsToShow}
                            keyExtractor={(item, index) => item?.href ?? index.toString()}
                            renderItem={renderItem}
                            ListFooterComponent={renderFooter}
                            ItemSeparatorComponent={renderSeparator}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <ListEmptyResults subtitle={LL.SWAP_EMPTY_LIST()} icon={"icon-search"} />
                            }
                        />
                    )}
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={onSetSelectedAccount}
                        selectedAccount={selectedAccount}
                        ref={selectAccountBottomSheetRef}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listContentContainer: {
            flexGrow: 1,
        },
    })
