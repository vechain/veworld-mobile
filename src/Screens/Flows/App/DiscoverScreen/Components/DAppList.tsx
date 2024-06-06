import React, { useCallback, useRef, useState } from "react"
import { DiscoveryDApp } from "~Constants"
import { FlatList } from "react-native-gesture-handler"
import { DAppCard } from "~Screens/Flows/App/DiscoverScreen/Components/DAppCard"
import { useScrollToTop } from "@react-navigation/native"
import { StyleSheet, TextInput } from "react-native"
import { BaseSkeleton, BaseSpacer, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { HeaderSection } from "./HeaderSection"
import Animated, {
    useAnimatedProps,
    useAnimatedRef,
    useDerivedValue,
    useScrollViewOffset,
} from "react-native-reanimated"

export enum DAppType {
    ALL = "all",
    SUSTAINABILTY = "sustainability",
    NFT = "NFT",
    DAPPS = "DAPPS",
}

// TODO - keep for favorites
// const filterDapps = (dapps: DiscoveryDApp[], searchText: string) => {
//     return dapps.filter(dapp => {
//         return (
//             dapp.name.toLowerCase().includes(searchText.toLowerCase()) ||
//             dapp.href.toLowerCase().includes(searchText.toLowerCase())
//         )
//     })
// }

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)
Animated.addWhitelistedNativeProps({ text: true })

type Props = {
    onDAppPress: (dapp: DiscoveryDApp) => void
    isLoading?: boolean
}

export const DAppList: React.FC<Props> = ({ onDAppPress, isLoading }: Props) => {
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const theme = useTheme()
    const [selectedDapps, setSelectedDapps] = useState(DAppType.ALL)
    const renderItem = useCallback(
        ({ item }: { item: DiscoveryDApp }) => {
            return <DAppCard dapp={item} onPress={onDAppPress} />
        },
        [onDAppPress],
    )
    const dapps: DiscoveryDApp[] = useAppSelector(selectFeaturedDapps)
    const filteredDapps = React.useMemo(() => {
        switch (selectedDapps) {
            case DAppType.ALL:
                return dapps

            case DAppType.SUSTAINABILTY:
                return dapps.filter(dapp => dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()))

            case DAppType.NFT:
                return dapps.filter(dapp => dapp.tags?.includes(DAppType.NFT.toLowerCase()))

            case DAppType.DAPPS:
                return dapps.filter(
                    dapp =>
                        !dapp.tags?.includes(DAppType.NFT.toLowerCase()) &&
                        !dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()),
                )

            default:
                return dapps
        }
    }, [dapps, selectedDapps])
    const renderSeparator = useCallback(() => <BaseSpacer height={24} />, [])
    const renderHeader = useCallback(() => {
        return <HeaderSection setSelectedDapps={setSelectedDapps} />
    }, [setSelectedDapps])
    const animatedRef = useAnimatedRef<Animated.ScrollView>()
    const offset = useScrollViewOffset(animatedRef)
    const text = useDerivedValue(() => `Scroll offset: ${offset.value.toFixed(1)}`)
    const animatedProps = useAnimatedProps(() => ({
        text: text.value,
        defaultValue: text.value,
    }))

    if (isLoading) {
        return (
            <BaseView flex={1} px={20}>
                {[1, 2, 3, 4].map(n => (
                    <BaseSkeleton
                        containerStyle={styles.skeleton}
                        key={n}
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={40}
                    />
                ))}
            </BaseView>
        )
    }

    return (
        <>
            <Animated.ScrollView ref={animatedRef}>
                {renderHeader()}

                <AnimatedTextInput editable={false} value={text.value} animatedProps={animatedProps} />

                <FlatList
                    ref={flatListRef}
                    data={filteredDapps}
                    contentContainerStyle={[styles.container]}
                    ItemSeparatorComponent={renderSeparator}
                    scrollEnabled={true}
                    keyExtractor={item => item.href}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                    numColumns={4}
                    columnWrapperStyle={styles.columnWrapperStyle}
                />
            </Animated.ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    columnWrapperStyle: {
        marginHorizontal: 24,
    },
    container: {
        paddingBottom: 24,
    },
    emptyListButton: {
        width: 250,
    },
    skeleton: {
        marginBottom: 10,
    },
    paddingTop: {
        paddingTop: 24,
    },
})
