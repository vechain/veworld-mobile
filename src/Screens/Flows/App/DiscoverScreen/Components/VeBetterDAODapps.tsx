import React, { useCallback, useMemo } from "react"
import {
    FlatList,
    Image,
    ImageSourcePropType,
    ListRenderItemInfo,
    StyleSheet,
    TouchableOpacityProps,
    useWindowDimensions,
} from "react-native"
import { localDaoDApps, localDaoDAppsMetadata, localDaoDAppsPlaceholder } from "~Assets"
import { BaseSkeleton, BaseSpacer, BaseText, BaseTouchable, BaseView, useNotifications } from "~Components"
import { useTheme, useVeBetterDaoDapps, useVeBetterDaoDAppsMetadata } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp } from "~Model"
import { URIUtils } from "~Utils"

type VeBetterDaoDAppCardProps = {
    containerStyle?: TouchableOpacityProps["style"]
    onPress: ({ href, custom }: { href: string; custom?: boolean }) => void
    item: VeBetterDaoDapp
    areDappsLoading?: boolean
}

type CardProps = {
    href: string
    source: ImageSourcePropType
    isError?: boolean
}

const VeBetterDaoDAppCard = ({ onPress, containerStyle, item, areDappsLoading }: VeBetterDaoDAppCardProps) => {
    const theme = useTheme()
    const { width: windowWidth } = useWindowDimensions()
    const cardWidth = windowWidth / 2.7
    const { data, isPending, error } = useVeBetterDaoDAppsMetadata(`ipfs://${item.metadataURI}`)
    const showSkeleton = isPending || !data || areDappsLoading
    const localDApp = localDaoDAppsMetadata.find(metdata => metdata.name === item.name)
    const { increaseDappCounter } = useNotifications()

    const onCardPress = useCallback(
        ({ href, dappId }: { href: string; custom?: boolean; dappId?: string }) => {
            if (dappId) {
                increaseDappCounter(dappId)
            }
            onPress({ href: href })
        },
        [increaseDappCounter, onPress],
    )

    const Card = useCallback(
        (props: CardProps) => {
            const { href, source, isError = false } = props

            return (
                <BaseTouchable
                    style={containerStyle}
                    action={() => onCardPress({ href: href, dappId: !isError ? item.id : undefined })}>
                    <Image
                        source={source}
                        style={[styles.image, { width: cardWidth, backgroundColor: theme.colors.card }]}
                        resizeMode="cover"
                    />
                </BaseTouchable>
            )
        },
        [cardWidth, containerStyle, item.id, onCardPress, theme.colors.card],
    )

    const getImagerSource = useCallback((source: number | string): ImageSourcePropType => {
        if (typeof source === "number") {
            return source
        }

        try {
            return { uri: URIUtils.convertUriToUrl(source ?? "") }
        } catch {
            return { uri: "" }
        }
    }, [])

    const getImageSourceValue = useMemo(() => {
        if (data?.ve_world?.banner) return data?.ve_world?.banner
        if (localDApp?.ve_world?.banner) return localDApp?.ve_world?.banner
        if (data?.banner) return data?.banner
        if (localDApp?.banner) return localDApp?.banner
        return ""
    }, [data?.banner, data?.ve_world?.banner, localDApp?.banner, localDApp?.ve_world?.banner])

    if (error) {
        return localDApp?.ve_world?.banner || localDApp?.banner ? (
            <Card
                href={localDApp.external_url}
                source={getImagerSource(localDApp.ve_world?.banner ?? localDApp?.banner)}
                isError={true}
            />
        ) : null
    }

    return showSkeleton ? (
        <BaseSkeleton
            animationDirection="horizontalLeft"
            containerStyle={[containerStyle, { width: cardWidth }]}
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[{ flexDirection: "column", height: "100%", width: "100%" }]}
        />
    ) : (
        <Card
            href={URIUtils.convertHttpToHttps(data?.external_url ?? "https://governance.vebetterdao.org/apps")}
            source={getImagerSource(getImageSourceValue)}
        />
    )
}

type VeBetterDAODAppsProps = {
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
}

export const VeBetterDAODApps = React.memo(({ onDAppPress }: VeBetterDAODAppsProps) => {
    const { LL } = useI18nContext()
    const { data: daoDapps, error, isPending } = useVeBetterDaoDapps()

    const data = useMemo(() => {
        // On first loading use a placeholder array to show the skeleton
        if (isPending && !daoDapps) {
            return localDaoDAppsPlaceholder
        }

        if (!error && daoDapps) {
            return daoDapps
        }

        return localDaoDApps
    }, [daoDapps, error, isPending])

    const renderSeparator = useCallback(() => {
        return <BaseSpacer width={24} />
    }, [])

    const renderItems = useCallback(
        ({ item, index }: ListRenderItemInfo<VeBetterDaoDapp>) => {
            const isFirst = index === 0
            const isLast = index === (daoDapps ?? []).length - 1

            return (
                <VeBetterDaoDAppCard
                    containerStyle={[
                        styles.listItemContainer,
                        isFirst ? styles.firstListItemContainer : undefined,
                        isLast ? styles.lastListItemContainer : undefined,
                    ]}
                    item={item}
                    onPress={onDAppPress}
                    areDappsLoading={isPending}
                />
            )
        },
        [daoDapps, isPending, onDAppPress],
    )

    return (
        <BaseView>
            <BaseText typographyFont="title" px={24}>
                {LL.DISCOVER_DAPPS_TITLE()}
            </BaseText>

            <BaseSpacer height={12} />

            <FlatList
                data={data}
                horizontal
                keyExtractor={item => item.id}
                ItemSeparatorComponent={renderSeparator}
                renderItem={renderItems}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        </BaseView>
    )
})

const styles = StyleSheet.create({
    listItemContainer: {
        borderRadius: 12,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        height: 76,
    },
    firstListItemContainer: {
        marginLeft: 24,
    },
    lastListItemContainer: {
        marginRight: 24,
    },
    image: {
        height: 76,
    },
})
