import React, { useCallback } from "react"
import {
    FlatList,
    Image,
    ListRenderItemInfo,
    StyleSheet,
    TouchableOpacityProps,
    useWindowDimensions,
} from "react-native"
import { DaoDapps } from "~Assets"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"

type VeBetterDaoDAppCardProps = {
    containerStyle?: TouchableOpacityProps["style"]
    onPress: ({ href, custom }: { href: string; custom?: boolean }) => void
} & DaoDapps

const VeBetterDaoDAppCard = ({ href, onPress, img, containerStyle }: VeBetterDaoDAppCardProps) => {
    const { width: windowWidth } = useWindowDimensions()
    const cardWidth = windowWidth / 2.7

    return (
        <BaseTouchable style={containerStyle} action={() => onPress({ href })}>
            <Image source={img} style={[styles.image, { width: cardWidth }]} resizeMode="cover" />
        </BaseTouchable>
    )
}

type VeBetterDAODAppsProps = {
    title: string
    daoDapps: DaoDapps[]
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
}

export const VeBetterDAODApps = React.memo(({ title, onDAppPress, daoDapps }: VeBetterDAODAppsProps) => {
    const renderSeparator = useCallback(() => {
        return <BaseSpacer width={24} />
    }, [])

    const renderItems = useCallback(
        ({ item, index }: ListRenderItemInfo<DaoDapps>) => {
            const isFirst = index === 0
            const isLast = index === daoDapps.length - 1

            return (
                <VeBetterDaoDAppCard
                    key={item.href}
                    containerStyle={[
                        styles.listItemContainer,
                        isFirst ? styles.firstListItemContainer : undefined,
                        isLast ? styles.lastListItemContainer : undefined,
                    ]}
                    {...item}
                    onPress={onDAppPress}
                />
            )
        },
        [daoDapps.length, onDAppPress],
    )

    return (
        <BaseView>
            <BaseText typographyFont="title" px={24}>
                {title}
            </BaseText>

            <BaseSpacer height={12} />

            <FlatList
                data={daoDapps}
                horizontal
                keyExtractor={item => item.href}
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
