import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseTouchable, BaseView, Layout, SignAndReject, useInAppBrowser } from "~Components"
import { ColorThemeType } from "~Constants"
import { useKeyboard, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import {
    selectAccountsByDevice,
    selectSelectedAccount,
    updateConnectedAppAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountDetailBox } from "../../WalletManagement/WalletDetailScreen/AccountDetailBox"

export const AppApprovalScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const navigation = useNavigation()
    const route = useRoute<RouteProp<RootStackParamListSwitch, Routes.CONNECTED_V2_APP_APPROVAL>>()

    const { request } = route.params

    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedDevice = selectedAccount.device
    const deviceAccounts = useAppSelector(state => selectAccountsByDevice(state, selectedDevice.rootAddress))

    const { postMessage } = useInAppBrowser()

    const [selectedAccounts, setSelectedAccounts] = useState<AccountWithDevice[]>([])
    const [isVisible, setIsVisible] = useState(true)

    const yOffset = useRef(0)
    const bottomInitialValue = -194
    const bottom = useSharedValue(bottomInitialValue)
    const { visible: keyboardVisible } = useKeyboard()

    const animatedStyle = useAnimatedStyle(() => {
        return {
            bottom: bottom.value,
        }
    })

    const isSelected = useCallback(
        (account: AccountWithDevice) => {
            return selectedAccounts.some(acc => acc.address === account.address)
        },
        [selectedAccounts],
    )

    const onAcountPress = useCallback(
        (item: AccountWithDevice) => {
            if (isSelected(item)) {
                setSelectedAccounts(selectedAccounts.filter(acc => acc.address !== item.address))
            } else {
                setSelectedAccounts([...selectedAccounts, item])
            }
        },
        [isSelected, selectedAccounts],
    )

    const HeaderComponent = useMemo(() => {
        return (
            <BaseView style={styles.headerContainer}>
                <BaseText typographyFont="title">{"Connection request"}</BaseText>
                <BaseSpacer height={10} />
                <BaseText typographyFont="body">{"Allow access to your account addresses"}</BaseText>
            </BaseView>
        )
    }, [styles.headerContainer])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<AccountWithDevice>) => {
            return (
                <BaseView style={styles.cardContainer}>
                    <BaseView style={styles.card}>
                        <AccountDetailBox
                            isBalanceVisible={true}
                            account={item}
                            isSelected={isSelected(item)}
                            isDisabled={false}
                            isEditable={false}
                        />
                    </BaseView>
                    <BaseTouchable activeOpacity={1} onPress={() => onAcountPress(item)} style={styles.cardTouchable} />
                </BaseView>
            )
        },
        [isSelected, onAcountPress, styles.card, styles.cardContainer, styles.cardTouchable],
    )

    const itemSeperator = useCallback(() => {
        return <BaseSpacer height={10} />
    }, [])

    useEffect(() => {
        let newValue = bottomInitialValue

        if (isVisible) {
            newValue = 0
        }

        bottom.value = withSpring(newValue, {
            mass: 1.2,
            damping: 22,
            stiffness: 190,
            overshootClamping: false,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 2,
            reduceMotion: ReduceMotion.System,
        })
    }, [bottom, bottomInitialValue, isVisible, keyboardVisible])

    const handleScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            e.persist()
            if (e.nativeEvent.contentOffset) {
                const shouldShow =
                    e.nativeEvent.contentOffset.y <= yOffset.current || e.nativeEvent.contentOffset.y <= 0
                if (shouldShow !== isVisible) {
                    setIsVisible(shouldShow)
                }
                yOffset.current = e.nativeEvent.contentOffset.y
            }
        },
        [isVisible],
    )

    const onConfirm = useCallback(() => {
        dispatch(
            updateConnectedAppAccounts({
                [request.origin]: selectedAccounts.map(account => account.address),
            }),
        )

        postMessage({
            id: request.id,
            data: selectedAccounts.map(account => account.address),
            method: request.method,
        })

        navigation.goBack()
    }, [dispatch, navigation, postMessage, request.id, request.method, request.origin, selectedAccounts])

    return (
        <Layout
            noMargin
            fixedHeader={HeaderComponent}
            fixedBody={
                <BaseView flex={1} flexGrow={1}>
                    <FlatList
                        data={deviceAccounts}
                        style={styles.list}
                        contentContainerStyle={styles.contentContainerStyle}
                        keyExtractor={account => account.address}
                        renderItem={renderItem}
                        ItemSeparatorComponent={itemSeperator}
                        ListFooterComponent={<BaseSpacer height={194} />}
                        onScroll={handleScroll}
                    />
                    <Animated.View style={[styles.buttonsContainer, animatedStyle]}>
                        <LinearGradient
                            style={styles.gradientContainer}
                            colors={[theme.colors.backgroundTransparent, theme.colors.background]}>
                            <SignAndReject
                                onConfirmTitle={"APPROVE"}
                                onRejectTitle={LL.COMMON_BTN_REJECT()}
                                onConfirm={onConfirm}
                                onReject={() => {}}
                                isConfirmLoading={false}
                                confirmButtonDisabled={selectedAccounts.length === 0}
                            />
                        </LinearGradient>
                    </Animated.View>
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        contentContainerStyle: {
            padding: 20,
            backgroundColor: theme.colors.background,
        },
        headerContainer: {
            padding: 20,
        },
        cardContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        card: {
            zIndex: 1,
        },
        cardTouchable: {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            borderRadius: 16,
            zIndex: 2,
        },
        list: {
            flex: 1,
        },
        buttonsContainer: {
            position: "absolute",
            height: 194,
            width: "100%",
        },
        gradientContainer: {
            width: "100%",
        },
    })
