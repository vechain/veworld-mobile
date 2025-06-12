import { default as React, useCallback, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    SelectAccountBottomSheet,
    useInAppBrowser,
} from "~Components"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, ConnectAppRequest, WatchedAccount } from "~Model"
import {
    selectFeaturedDapps,
    selectSelectedAccount,
    selectVisibleAccountsWithoutObserved,
    useAppSelector,
} from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

type Request = {
    request: Extract<ConnectAppRequest, { type: "in-app" }>
}

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseSpacer = Animated.createAnimatedComponent(wrapFunctionComponent(BaseSpacer))

export const ConnectBottomSheet = () => {
    const { LL } = useI18nContext()
    const { connectBsRef } = useInAppBrowser()
    const { ref } = useBottomSheetModal({ externalRef: connectBsRef })
    const { ref: accountBsRef, onClose: onAccountBsClose, onOpen: onAccountBsOpen } = useBottomSheetModal()

    const { styles, theme } = useThemedStyles(baseStyles)

    const allApps = useAppSelector(selectFeaturedDapps)
    const _selectedAccount = useAppSelector(selectSelectedAccount)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)

    const [loadFallback, setLoadFallback] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [selectedAccount, _setSelectedAccount] = useState(_selectedAccount)

    const getInfo = useCallback(
        (req: Request) => {
            const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(req.request.appUrl).origin)
            if (foundDapp)
                return {
                    icon: foundDapp.id
                        ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                        : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                    name: foundDapp.name,
                    url: req.request.appUrl,
                }

            return {
                name: req.request.appName,
                url: req.request.appUrl,
                icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(req.request.appUrl).origin}`,
            }
        },
        [allApps],
    )

    const opacityStyles = useAnimatedStyle(() => {
        return {
            opacity: showDetails ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
            height: showDetails ? "auto" : 0,
            padding: showDetails ? withTiming(16, { duration: 300 }) : withTiming(0, { duration: 300 }),
        }
    }, [showDetails])

    const spacerStyles = useAnimatedStyle(() => {
        return {
            opacity: showDetails ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
            height: showDetails ? 16 : 0,
        }
    }, [showDetails])

    const onConnect = useCallback(() => {}, [])
    const onCancel = useCallback(() => {}, [])

    const setSelectedAccount = useCallback((account: AccountWithDevice | WatchedAccount) => {
        if ("device" in account) _setSelectedAccount(account)
    }, [])

    return (
        <>
            <BaseBottomSheet<Request> dynamicHeight contentStyle={styles.rootContent} ref={ref}>
                {data => {
                    const { icon, name, url } = getInfo(data)
                    return (
                        <>
                            <BaseView flexDirection="row" justifyContent="space-between">
                                <BaseView flexDirection="row" gap={12}>
                                    <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                                        {LL.CONNECTION_REQUEST_TITLE()}
                                    </BaseText>
                                </BaseView>
                                <AccountSelector account={selectedAccount} onPress={onAccountBsOpen} />
                            </BaseView>
                            <BaseSpacer height={24} />
                            <AnimatedBaseView
                                bg={COLORS.WHITE}
                                p={16}
                                flexDirection="column"
                                layout={LinearTransition.duration(300)}
                                borderRadius={12}>
                                <AnimatedBaseView flexDirection="row" gap={12} layout={LinearTransition.duration(300)}>
                                    <BaseView flexDirection="row" gap={16} flex={1}>
                                        <Image
                                            source={
                                                loadFallback
                                                    ? require("~Assets/Img/dapp-fallback.png")
                                                    : {
                                                          uri: icon,
                                                      }
                                            }
                                            style={[{ height: 48, width: 48 }, styles.icon] as StyleProp<ImageStyle>}
                                            onError={() => setLoadFallback(true)}
                                            resizeMode="contain"
                                        />
                                        <BaseView flexDirection="column" gap={2}>
                                            <BaseText
                                                typographyFont="bodyMedium"
                                                numberOfLines={1}
                                                color={COLORS.GREY_800}>
                                                {name}
                                            </BaseText>
                                            <BaseText
                                                typographyFont="captionMedium"
                                                numberOfLines={1}
                                                color={COLORS.GREY_500}>
                                                {url}
                                            </BaseText>
                                        </BaseView>
                                    </BaseView>
                                    <BaseButton
                                        action={() => setShowDetails(old => !old)}
                                        variant="ghost"
                                        rightIcon={
                                            <BaseIcon
                                                name={showDetails ? "icon-chevron-up" : "icon-chevron-down"}
                                                size={12}
                                                color={COLORS.PRIMARY_800}
                                                style={styles.rightIcon}
                                            />
                                        }>
                                        {showDetails ? LL.HIDE() : LL.DETAILS()}
                                    </BaseButton>
                                </AnimatedBaseView>
                                <AnimatedBaseSpacer style={[spacerStyles]} />
                                <AnimatedBaseView
                                    layout={LinearTransition.duration(300)}
                                    style={[styles.detailsContainer, opacityStyles]}
                                    flexDirection="column"
                                    borderRadius={8}>
                                    <BaseText typographyFont="bodyMedium" color={COLORS.GREY_800}>
                                        {LL.CONNECTED_APP_ASKING_FOR_ACCESS({ dappName: name })}
                                    </BaseText>
                                    <AnimatedBaseView
                                        layout={LinearTransition.duration(300)}
                                        flexDirection="column"
                                        ml={8}
                                        gap={8}>
                                        {([1, 2] as const).map(value => (
                                            <AnimatedBaseView
                                                layout={LinearTransition.duration(300)}
                                                flexDirection="row"
                                                gap={8}
                                                key={value}
                                                alignItems="flex-start">
                                                <BaseIcon name="icon-check" color={COLORS.GREY_400} size={12} />
                                                <BaseText color={COLORS.GREY_600} typographyFont="captionRegular">
                                                    {LL[`CONNECTED_APP_ASKING_FOR_ACCESS_${value}`]()}
                                                </BaseText>
                                            </AnimatedBaseView>
                                        ))}
                                    </AnimatedBaseView>
                                </AnimatedBaseView>
                            </AnimatedBaseView>
                            <BaseSpacer height={24} />
                            <BaseView flexDirection="row" gap={16}>
                                <BaseButton action={onCancel} variant="outline" flex={1}>
                                    {LL.COMMON_BTN_CANCEL()}
                                </BaseButton>
                                <BaseButton action={onConnect} flex={1}>
                                    {LL.COMMON_BTN_APPLY()}
                                </BaseButton>
                            </BaseView>
                        </>
                    )
                }}
            </BaseBottomSheet>

            <SelectAccountBottomSheet
                ref={accountBsRef}
                closeBottomSheet={onAccountBsClose}
                selectedAccount={selectedAccount}
                accounts={visibleAccounts}
                setSelectedAccount={setSelectedAccount}
                isVthoBalance
                isBalanceVisible
            />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        detailsContainer: {
            backgroundColor: COLORS.GREY_50,
            borderColor: COLORS.GREY_100,
            borderWidth: 1,
            padding: 16,
            gap: 12,
        },
        rightIcon: {
            marginLeft: 2,
        },
    })
