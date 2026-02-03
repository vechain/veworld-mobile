import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import {
    BaseButton,
    BaseIcon,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseView,
    CloudKitWalletCard,
    InfoBottomSheet,
    Layout,
} from "~Components"
import { COLORS } from "~Constants/Theme"
import { useBottomSheetModal, useCloudBackup, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CloudKitWallet, DrivetWallet } from "~Model"
import { RootStackParamListOnboarding, Routes } from "~Navigation"
import { PlatformUtils } from "~Utils"

const skeletonArray = [1, 2, 3, 4]

export const ImportFromCloudScreen = () => {
    const nav = useNavigation()

    const route = useRoute<RouteProp<RootStackParamListOnboarding, Routes.IMPORT_FROM_CLOUD>>()
    const { wallets } = route.params

    const theme = useTheme()
    const { getAllWalletFromCloud } = useCloudBackup()
    const { LL } = useI18nContext()
    const [cloudKitWallets, setCloudKitWallets] = useState<CloudKitWallet[] | DrivetWallet[]>(wallets ?? [])
    const [selected, setSelected] = useState<CloudKitWallet | null>(null)

    const [isLoading, setIsLoading] = useState(false)

    const Seperator = useMemo(() => <BaseSpacer height={16} />, [])

    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            const _wallets = await getAllWalletFromCloud()
            setCloudKitWallets(_wallets)
            setIsLoading(false)
        }
        cloudKitWallets.length <= 0 && init()
    }, [cloudKitWallets.length, getAllWalletFromCloud])

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())
    const closeOtherSwipeableItems = useCallback(() => {
        swipeableItemRefs?.current.forEach(ref => {
            ref?.close()
        })
    }, [swipeableItemRefs])

    const { ref: infoBottomSheetRef, onOpen: openInfoBottomSheet } = useBottomSheetModal()

    const onWalletSelected = useCallback(
        (wallet: CloudKitWallet) => {
            closeOtherSwipeableItems()
            if (selected?.rootAddress === wallet.rootAddress) {
                setSelected(null)
            } else {
                setSelected(wallet)
            }
        },
        [closeOtherSwipeableItems, selected?.rootAddress],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<CloudKitWallet>) => {
            return <CloudKitWalletCard wallet={item} selected={selected} onPress={() => onWalletSelected(item)} />
        },
        [selected, onWalletSelected],
    )

    const renderContent = useCallback(() => {
        if (isLoading) {
            return (
                <FlatList
                    testID="IMPORT_FROM_CLOUD_LIST_SKELETON"
                    data={skeletonArray}
                    contentContainerStyle={styles.listContentContainer_Skeleton}
                    ItemSeparatorComponent={() => Seperator}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={() => (
                        <BaseSkeleton
                            height={74}
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            containerStyle={styles.skeletonCard}
                            borderRadius={16}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )
        }

        if (cloudKitWallets) {
            return (
                <Animated.FlatList
                    testID="IMPORT_FROM_CLOUD_LIST"
                    layout={LinearTransition}
                    data={cloudKitWallets}
                    contentContainerStyle={styles.listContentContainer}
                    ItemSeparatorComponent={() => Seperator}
                    keyExtractor={item => item.rootAddress}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            )
        }

        return null
    }, [
        renderItem,
        isLoading,
        cloudKitWallets,
        Seperator,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
    ])

    return (
        <Layout
            title={PlatformUtils.isIOS() ? LL.TITLE_IMPORT_WALLET_FROM_ICLOUD() : LL.TITLE_IMPORT_WALLET_FROM_DRIVE()}
            headerRightElement={
                <BaseIcon
                    name="icon-info"
                    size={20}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                    action={openInfoBottomSheet}
                />
            }
            fixedBody={
                <BaseView flex={1} gap={24} mt={16} px={24}>
                    <BaseIcon name="icon-cloud" size={48} color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.PURPLE} />
                    <BaseText
                        typographyFont="bodyMedium"
                        align="center"
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                        {LL.WALLET_IMPORT_CLOUD_DESCRIPTION()}
                    </BaseText>

                    {renderContent()}

                    <InfoBottomSheet
                        bsRef={infoBottomSheetRef}
                        title={LL.BS_INFO_IMPORTING_FROM_CLOUD_TITLE()}
                        description={LL.BS_INFO_IMPORTING_FROM_CLOUD_DESCRIPTION()}
                    />
                </BaseView>
            }
            footer={
                <BaseButton
                    testID="IMPORT_FROM_CLOUD_CONTINUE_BUTTON"
                    title={LL.BTN_CONTINUE()}
                    action={() => {
                        if (selected) {
                            nav.navigate(Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD, { wallet: selected })
                        }
                    }}
                    disabled={!selected}
                    isLoading={isLoading}
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    alreadyImported: {
        backgroundColor: "red",
    },
    wallet: {
        opacity: 0.7,
    },
    skeletonCard: {
        borderRadius: 16,
    },
    rightSubContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    eyeIcon: { marginLeft: 16, flex: 0.1 },
    listContentContainer_Skeleton: {
        flexGrow: 1,
        paddingTop: 12,
    },
    listContentContainer: {
        flexGrow: 1,
        paddingTop: 12,
    },
})
