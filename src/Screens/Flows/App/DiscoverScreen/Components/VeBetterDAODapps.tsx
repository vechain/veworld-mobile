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
import { BaseSkeleton, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp } from "~Model"
import { URIUtils } from "~Utils"
import { useVeBetterDaoDapps, useVeBetterDaoDAppsMetadata } from "../Hooks"

type VeBetterDaoDAppCardProps = {
    containerStyle?: TouchableOpacityProps["style"]
    onPress: ({ href, custom }: { href: string; custom?: boolean }) => void
    item: VeBetterDaoDapp
    areDappsLoading?: boolean
}

const VeBetterDaoDAppCard = ({ onPress, containerStyle, item, areDappsLoading }: VeBetterDaoDAppCardProps) => {
    const theme = useTheme()
    const { width: windowWidth } = useWindowDimensions()
    const cardWidth = windowWidth / 2.7
    const { data, isPending, error } = useVeBetterDaoDAppsMetadata(`ipfs://${item.metadataURI}`)
    const showSkeleton = isPending || !data || areDappsLoading

    const Card = useCallback(
        ({ href, source }: { href: string; source: ImageSourcePropType }) => {
            return (
                <BaseTouchable style={containerStyle} action={() => onPress({ href: href })}>
                    <Image
                        source={source}
                        style={[styles.image, { width: cardWidth, backgroundColor: theme.colors.card }]}
                        resizeMode="cover"
                    />
                </BaseTouchable>
            )
        },
        [cardWidth, containerStyle, onPress, theme.colors.card],
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

    if (error) {
        const dapp = localDaoDAppsMetadata.find(metdata => metdata.name === item.name)
        return dapp ? (
            <Card href={dapp.external_url} source={getImagerSource(dapp?.we_world?.banner ?? dapp.banner ?? "")} />
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
        <Card href={data?.external_url ?? ""} source={getImagerSource(data?.we_world?.banner ?? data.banner ?? "")} />
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
