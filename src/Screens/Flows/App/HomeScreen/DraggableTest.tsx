/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, Pressable, View } from "react-native"
import {
    RenderItemParams,
    NestableScrollContainer,
    NestableDraggableFlatList,
    ShadowDecorator,
} from "react-native-draggable-flatlist"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { AccountsCarousel, Header, TabbarHeader } from "./Components"
import { Device, useListListener, useRealm } from "~Storage"
import HomeScreenBottomSheet from "./Components/HomeScreenBottomSheet"
import { useBottomSheetModal } from "~Common"
import { useActiveWalletEntity } from "~Common/Hooks/Entities"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useMeoizedAnimation } from "./Hooks/useMeoizedAnimation"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

if (__DEV__) {
    const ignoreWarns = [
        "VirtualizedLists should never be nested inside plain ScrollViews",
    ]

    const errorWarn = global.console.error
    global.console.error = (...arg) => {
        for (const error of ignoreWarns) {
            if (arg[0].startsWith(error)) {
                return
            }
        }
        errorWarn(...arg)
    }
}

const NUM_ITEMS = 20
function getColor(i: number) {
    const multiplier = 255 / (NUM_ITEMS - 1)
    const colorVal = i * multiplier
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`
}

type Item = {
    key: string
    label: string
    height: number
    width: number
    backgroundColor: string
}

const initialData: Item[] = [...Array(NUM_ITEMS)].map((d, index) => {
    const backgroundColor = getColor(index)
    return {
        key: `item-${index}`,
        label: String(index) + "",
        height: 100,
        width: 60 + Math.random() * 40,
        backgroundColor,
    }
})

export function DraggableTest() {
    const [data, setData] = useState(initialData)

    const [activeScreen, setActiveScreen] = useState(0)
    const [isEdit, setIsEdit] = useState(false)

    const { store } = useRealm()
    const devices = useListListener(Device.getName(), store) as Device[]
    const activeCard = useActiveWalletEntity()

    const {
        ref: bottomSheetRef,
        onOpen: openBottomSheetMenu,
        onClose: closeBottomSheetMenu,
    } = useBottomSheetModal()

    const activeDevice = useMemo(() => devices[0], [devices])

    const activeCardIndex = useMemo(
        () => activeCard.activeIndex,
        [activeCard.activeIndex],
    )

    useEffect(() => {
        console.log("activeCardIndex", activeCardIndex)
    }, [activeCardIndex])

    const renderSeparator = useCallback(() => <BaseSpacer height={10} />, [])

    const onDrag = useCallback(
        (drag: any) => {
            return isEdit ? drag() : undefined
        },
        [isEdit],
    )

    const animatedWidthRow = useAnimatedStyle(() => {
        return {
            width: withTiming(isEdit ? "88%" : "100%", {
                duration: 200,
            }),
        }
    }, [isEdit])

    const animatedPositionInnerRow = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(isEdit ? 40 : 0, {
                        duration: 200,
                    }),
                },
            ],
        }
    }, [isEdit])

    const animatedOpacity = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isEdit ? 1 : 0, {
                duration: 200,
            }),
        }
    }, [isEdit])

    const animatedOpacityReverse = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isEdit ? 0 : 1, {
                duration: 200,
            }),
        }
    }, [isEdit])

    const animatedDeleteIcon = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(isEdit ? -10 : 0, {
                        duration: 200,
                    }),
                },
            ],
        }
    }, [isEdit])

    const onDeleteItem = useCallback((item: Item) => {
        console.log("onDeleteItem", item)
    }, [])

    const renderItem = useCallback(
        ({ item, drag, isActive }: RenderItemParams<Item>) => {
            return (
                <ShadowDecorator>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}>
                        <Animated.View style={animatedWidthRow}>
                            <Pressable
                                onLongPress={() => onDrag(drag)}
                                disabled={isActive}
                                style={[
                                    {
                                        borderRadius: 10,
                                        height: 62,
                                        marginHorizontal: 20,
                                    },
                                ]}>
                                <Animated.View
                                    style={{
                                        backgroundColor: item.backgroundColor,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        borderRadius: 10,
                                        opacity: isActive ? 0.6 : 1,
                                    }}>
                                    <Animated.View
                                        style={[
                                            animatedOpacity,
                                            {
                                                position: "absolute",
                                                marginLeft: 12,
                                            },
                                        ]}>
                                        <BaseIcon
                                            name={"apps-outline"}
                                            size={28}
                                            action={() => onDeleteItem(item)}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        style={[
                                            animatedPositionInnerRow,
                                            {
                                                flexDirection: "row",
                                                justifyContent: "flex-start",
                                                borderRadius: 10,
                                                paddingHorizontal: 14,
                                                paddingVertical: 12,
                                                height: "100%",
                                                width: "100%",
                                            },
                                        ]}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                width: "100%",
                                            }}>
                                            <View
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    backgroundColor: "red",
                                                    borderRadius: 20,
                                                    marginRight: 10,
                                                    position: "absolute",
                                                }}
                                            />

                                            <View style={{ marginLeft: 50 }}>
                                                <BaseText typographyFont="subTitle">
                                                    Coin Name
                                                </BaseText>
                                                <BaseText>{`${item.label} CNO`}</BaseText>
                                            </View>

                                            <Animated.View
                                                style={animatedOpacityReverse}>
                                                <BaseText typographyFont="title">
                                                    0.2202
                                                </BaseText>
                                                <BaseText>CNO</BaseText>
                                            </Animated.View>
                                        </View>
                                    </Animated.View>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>

                        <Animated.View style={animatedDeleteIcon}>
                            <BaseIcon
                                name={"add-sharp"}
                                size={32}
                                bg={"pink"}
                                action={() => onDeleteItem(item)}
                            />
                        </Animated.View>
                    </View>
                </ShadowDecorator>
            )
        },
        [
            animatedDeleteIcon,
            animatedOpacity,
            animatedOpacityReverse,
            animatedPositionInnerRow,
            animatedWidthRow,
            onDeleteItem,
            onDrag,
        ],
    )

    const ListHeaderComponent = useMemo(() => {
        return (
            <>
                <BaseView align="center">
                    <Header action={openBottomSheetMenu} />
                    <BaseSpacer height={20} />
                    <AccountsCarousel accounts={activeDevice.accounts} />
                </BaseView>

                <BaseSpacer height={10} />
                <TabbarHeader action={setActiveScreen} />
                <BaseSpacer height={20} />
            </>
        )
    }, [activeDevice.accounts, openBottomSheetMenu])

    const { coinListEnter, coinListExit, NFTListEnter, NFTListExit } =
        useMeoizedAnimation()

    const paddingBottom = useBottomTabBarHeight()

    const visibleHeightRef = useRef<number>(0)

    return (
        <>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom, paddingTop: 60 }}
                onContentSizeChange={visibleHeight => {
                    visibleHeightRef.current = visibleHeight
                }}>
                {ListHeaderComponent}

                <BaseView
                    orientation="row"
                    justify="space-evenly"
                    align="center"
                    background="pink"
                    px={20}
                    py={30}>
                    <BaseText>Buy</BaseText>
                    <BaseText>Send</BaseText>
                    <BaseText>Swap</BaseText>
                    <BaseText>History</BaseText>
                </BaseView>

                <BaseView
                    orientation="row"
                    justify="space-between"
                    align="center"
                    px={20}
                    my={20}>
                    <BaseText typographyFont="subTitle">Your Tokens</BaseText>
                    <BaseButton
                        bgColor={isEdit ? "red" : "green"}
                        title="Edit"
                        action={() => setIsEdit(prevState => !prevState)}
                    />
                </BaseView>

                {activeScreen === 0 ? (
                    <Animated.View
                        entering={coinListEnter}
                        exiting={coinListExit}>
                        <FlatList
                            data={[
                                { key: "1", label: "VET" },
                                { key: "2", label: "VTHO" },
                            ]}
                            keyExtractor={item => item.key}
                            renderItem={({ item }) => {
                                return (
                                    <BaseView
                                        style={{
                                            width: "100%",
                                            height: 162,
                                            backgroundColor: "pink",
                                            marginBottom: 10,
                                        }}>
                                        <BaseText>{item.label}</BaseText>
                                    </BaseView>
                                )
                            }}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={renderSeparator}
                        />

                        <NestableDraggableFlatList
                            data={data}
                            extraData={isEdit}
                            onDragEnd={({ data }) => setData(data)}
                            keyExtractor={item => item.key}
                            renderItem={renderItem}
                            activationDistance={40}
                            showsVerticalScrollIndicator={false}
                            autoscrollThreshold={visibleHeightRef.current}
                            ItemSeparatorComponent={renderSeparator}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={NFTListEnter}
                        exiting={NFTListExit}>
                        <FlatList
                            data={data}
                            keyExtractor={item => item.key}
                            renderItem={({ item }) => {
                                return (
                                    <BaseView
                                        style={{
                                            width: 100,
                                            height: 100,
                                            backgroundColor: "pink",
                                            margin: 10,
                                        }}>
                                        <BaseText>{item.label}</BaseText>
                                    </BaseView>
                                )
                            }}
                            showsVerticalScrollIndicator={false}
                        />
                    </Animated.View>
                )}
            </NestableScrollContainer>

            <HomeScreenBottomSheet
                ref={bottomSheetRef}
                onClose={closeBottomSheetMenu}
                activeDevice={activeDevice}
            />
        </>
    )
}
