/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo, useState } from "react"
import { FlatList, Image, Linking, StyleSheet, TouchableOpacity } from "react-native"
import { randomized as daoDapps, VeBetterBaoDarkSVG } from "~Assets"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { AnalyticsEvent, SCREEN_WIDTH } from "~Constants"
import { useI18nContext } from "~i18n"
import { addNavigationToDApp, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { getAppHubIconUrl } from "../utils"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { RumManager } from "~Logging"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { DAppType } from "./DAppList"

const DAO_URL = "https://governance.vebetterdao.org/"

export const HeaderSection = ({
    setSelectedDapps,
}: {
    setSelectedDapps: React.Dispatch<React.SetStateAction<DAppType>>
}) => {
    const renderSeparatorDaoDapps = useCallback(() => <BaseSpacer width={24} />, [])
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [activeButton, setActiveButton] = useState(DAppType.ALL)

    const { styles, theme } = useThemedStyles(baseStyles)

    const onSeeAllPress = useCallback(() => nav.navigate(Routes.DISCOVER_FAVOURITES), [nav])
    const track = useAnalyticTracking()
    const ddLogger = useMemo(() => new RumManager(), [])
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const dispatch = useAppDispatch()

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_USER_OPENED_DAPP")

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [track, dispatch, nav, ddLogger],
    )

    return (
        <>
            <BaseSpacer height={12} />

            <BaseView w={100} justifyContent="center" alignItems="center" style={theme.shadows.card}>
                <BaseSpacer height={12} />

                <BaseTouchable style={styles.headerContainer} action={() => onDAppPress({ href: DAO_URL })}>
                    <VeBetterBaoDarkSVG width={SCREEN_WIDTH - 96} height={162} />
                    <Icon name={"open-in-new"} size={16} color={theme.colors.primary} style={styles.iconStyle} />
                </BaseTouchable>
            </BaseView>

            <BaseSpacer height={36} />

            <BaseText typographyFont="title" px={24}>
                {LL.DISCOVER_DAPPS_TITLE()}
            </BaseText>

            <BaseSpacer height={12} />

            <FlatList
                data={daoDapps}
                horizontal
                contentContainerStyle={styles.paddingLeft}
                ItemSeparatorComponent={renderSeparatorDaoDapps}
                scrollEnabled={true}
                keyExtractor={item => item.href}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                    return (
                        <BaseTouchable
                            style={[styles.listItemContainer]}
                            action={() => onDAppPress({ href: item.href })}>
                            <Image
                                source={item.img}
                                style={{
                                    width: SCREEN_WIDTH / 2.7,
                                    height: 76,
                                }}
                                resizeMode="cover"
                            />
                        </BaseTouchable>
                    )
                }}
            />

            <BaseSpacer height={60} />

            <TouchableOpacity
                style={[styles.makeYourOwnBanner, theme.shadows.card]}
                onPress={async () => {
                    const url = process.env.REACT_APP_CREATE_YOUR_VECHAIN_DAPP_URL
                    if (url && (await Linking.canOpenURL(url))) {
                        Linking.openURL(url)
                    }
                }}>
                <BaseView flexDirection="row" alignItems="center" bg={theme.colors.card}>
                    <BaseView flex={0.4} px={12}>
                        <BaseText typographyFont="subTitle" align="center">
                            {LL.DISCOVER_CREATE_YOUR_DAPP()}
                        </BaseText>
                    </BaseView>
                    <BaseView flex={0.6}>
                        <Image
                            source={require("../../../../../Assets/Img/NFTPlaceholder.png")}
                            style={{
                                width: 200,
                                height: 100,
                            }}
                            resizeMode="cover"
                        />
                        <Icon name={"open-in-new"} size={16} color={theme.colors.primary} style={styles.iconStyle} />
                    </BaseView>
                </BaseView>
            </TouchableOpacity>

            <BaseSpacer height={48} />

            <BaseView bg={theme.colors.tertiary}>
                <BaseSpacer height={24} />

                <BaseView flexDirection="row" w={100} justifyContent="space-between" alignItems="center">
                    <BaseText typographyFont="bodyBold" px={24}>
                        {LL.DISCOVER_TAB_FAVOURITES()}
                    </BaseText>

                    <BaseTouchable style={styles.px} action={onSeeAllPress}>
                        <BaseText typographyFont="body">{LL.DISCOVER_SEE_ALL_BOOKMARKS()}</BaseText>
                    </BaseTouchable>
                </BaseView>

                <BaseSpacer height={12} />

                <FlatList
                    data={bookmarkedDApps.slice(0, 5)}
                    horizontal
                    contentContainerStyle={styles.paddingLeft}
                    scrollEnabled={true}
                    keyExtractor={item => item.href}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => {
                        return (
                            <BaseView style={{ width: SCREEN_WIDTH / 4 }} justifyContent="center" alignItems="center">
                                <BaseTouchable
                                    style={styles.favoriteContainer}
                                    action={() => onDAppPress({ href: item.href, custom: item.isCustom })}>
                                    <Image
                                        source={{
                                            uri: item.id
                                                ? getAppHubIconUrl(item.id)
                                                : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${item.href}`,
                                        }}
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 32,
                                        }}
                                        resizeMode="contain"
                                    />
                                </BaseTouchable>

                                <BaseText typographyFont="caption" numberOfLines={1} pt={8}>
                                    {item.name}
                                </BaseText>
                            </BaseView>
                        )
                    }}
                />

                <BaseSpacer height={24} />
            </BaseView>

            <BaseSpacer height={36} />

            <BaseView>
                <BaseText typographyFont="title" px={24}>
                    {LL.DISCOVER_ECOSYSTEM()}
                </BaseText>

                <BaseSpacer height={24} />

                <BaseView flexDirection="row" justifyContent="space-evenly">
                    <BaseTouchable
                        underlined={activeButton === DAppType.ALL}
                        font="bodyBold"
                        title="All"
                        action={() => {
                            setSelectedDapps(DAppType.ALL)
                            setActiveButton(DAppType.ALL)
                        }}
                    />

                    <BaseTouchable
                        underlined={activeButton === DAppType.SUSTAINABILTY}
                        font="bodyBold"
                        title="Sustainablity"
                        action={() => {
                            setSelectedDapps(DAppType.SUSTAINABILTY)
                            setActiveButton(DAppType.SUSTAINABILTY)
                        }}
                    />
                    <BaseTouchable
                        underlined={activeButton === DAppType.NFT}
                        font="bodyBold"
                        title="NFTs"
                        action={() => {
                            setSelectedDapps(DAppType.NFT)
                            setActiveButton(DAppType.NFT)
                        }}
                    />
                    <BaseTouchable
                        underlined={activeButton === DAppType.DAPPS}
                        font="bodyBold"
                        title="DApps"
                        action={() => {
                            setSelectedDapps(DAppType.DAPPS)
                            setActiveButton(DAppType.DAPPS)
                        }}
                    />
                </BaseView>

                <BaseSpacer height={36} />
            </BaseView>
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        headerContainer: {
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#B1F16C",
            width: SCREEN_WIDTH - 48,
            justifyContent: "center",
            alignItems: "center",
        },

        listItemContainer: {
            borderRadius: 12,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            width: SCREEN_WIDTH / 2.7,
            height: 76,
        },

        paddingLeft: {
            paddingLeft: 24,
        },

        favoriteContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
        },

        px: {
            paddingHorizontal: 24,
        },

        iconStyle: {
            position: "absolute",
            right: 10,
            top: 10,
        },

        makeYourOwnBanner: {
            borderRadius: 12,
            overflow: "hidden",
            marginHorizontal: 24,
        },
    })
