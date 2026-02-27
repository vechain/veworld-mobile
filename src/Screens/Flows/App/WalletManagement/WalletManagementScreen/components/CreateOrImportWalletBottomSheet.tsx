import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, StretchInY, StretchOutY } from "react-native-reanimated"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, CardListItem } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { Routes } from "~Navigation"
import { selectHasOnboarded, selectUserHasSmartWallet, useAppSelector } from "~Storage/Redux"
import { ImportWalletOptions, SocialWalletOptions } from "./CreateOrImportBottomsheetViews"

type Props = {
    onClose: () => void
    handleOnCreateWallet: () => void
}

export const CreateOrImportWalletBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, handleOnCreateWallet }, ref) => {
        const [navigationState, setNavigationState] = useState<"root" | "social" | "import">("root")

        const { LL } = useI18nContext()
        const nav = useNavigation()
        const { styles, theme } = useThemedStyles(baseStyles)
        const track = useAnalyticTracking()
        const userHasOnboarded = useAppSelector(selectHasOnboarded)
        const hasSocialWallet = useAppSelector(selectUserHasSmartWallet)

        const onObserveWallet = useCallback(() => {
            onClose()
            track(AnalyticsEvent.SELECT_WALLET_OBSERVE_WALLET)
            setTimeout(() => {
                nav.navigate(Routes.OBSERVE_WALLET)
            }, 400)
        }, [nav, track, onClose])

        const options = useMemo(() => {
            return [
                {
                    id: "social",
                    title: LL.SB_TITLE_CONTINUE_WITH_SOCIAL_LOGIN(),
                    description: LL.SB_DESCRIPTION_CONTINUE_WITH_SOCIAL_LOGIN(),
                    icon: "icon-at-sign",
                    action: () => {
                        setNavigationState("social")
                    },
                },
                {
                    id: "create",
                    title: LL.BTN_CREATE_WALLET(),
                    description: LL.SB_DESCRIPTION_CREATE_WALLET(),
                    icon: "icon-plus-circle",
                    action: handleOnCreateWallet,
                },
                {
                    id: "import",
                    title: LL.SB_TITLE_ADD_EXISTING_WALLET(),
                    description: LL.SB_DESCRIPTION_ADD_EXISTING_WALLET(),
                    icon: "icon-rotate-cw",
                    action: () => {
                        setNavigationState("import")
                    },
                },

                {
                    id: "observe",
                    title: LL.BTN_OBSERVE_WALLET(),
                    description: LL.BTN_OBSERVE_WALLET_SUBTITLE(),
                    icon: "icon-eye",
                    action: onObserveWallet,
                },
            ]
        }, [LL, handleOnCreateWallet, onObserveWallet])

        const ItemsSeparator = useCallback(() => {
            return <BaseSpacer height={16} />
        }, [])

        const avaliableOptions = useMemo(() => {
            return options.filter(option => {
                if (option.id === "social" && hasSocialWallet) {
                    return false
                }
                if (option.id === "observe") {
                    return userHasOnboarded
                }
                return true
            })
        }, [hasSocialWallet, options, userHasOnboarded])

        const modalTitle = useMemo(() => {
            if (navigationState === "social") {
                return LL.SB_TITLE_CONTINUE_WITH_SOCIAL_LOGIN()
            }
            if (navigationState === "import") {
                return LL.SB_TITLE_ADD_EXISTING_WALLET()
            }
            return LL.TITLE_CREATE_WALLET_TYPE()
        }, [navigationState, LL])

        const modalDescription = useMemo(() => {
            if (navigationState === "social") {
                return LL.SB_DESCRIPTION_CONTINUE_WITH_SOCIAL_LOGIN()
            }
            if (navigationState === "import") {
                return LL.SB_DESCRIPTION_ADD_EXISTING_WALLET()
            }
            return LL.BD_CREATE_WALLET_TYPE()
        }, [navigationState, LL])

        const onDismiss = useCallback(() => {
            setNavigationState("root")
        }, [])

        const onGoBack = useCallback(() => {
            if (navigationState !== "root") {
                setNavigationState("root")
                return
            }
            onClose()
        }, [navigationState, onClose])

        return (
            <BaseBottomSheet
                dynamicHeight
                ref={ref}
                scrollable={false}
                floating
                backgroundStyle={styles.rootSheet}
                handleComponent={() => <BaseView p={8} />}
                onDismiss={onDismiss}>
                <BaseView flexDirection="column" w={100} position="relative">
                    <BaseTouchable style={styles.closeButton} action={onGoBack}>
                        <BaseIcon
                            name="icon-x"
                            size={24}
                            color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}
                        />
                    </BaseTouchable>
                    <BaseText typographyFont="subTitleBold">{modalTitle}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body">{modalDescription}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                {navigationState === "root" && (
                    <Animated.View
                        style={styles.rootSheetContent}
                        entering={StretchInY.duration(200)}
                        exiting={StretchOutY.duration(200)}
                        layout={LinearTransition}>
                        <Animated.FlatList
                            data={avaliableOptions}
                            keyExtractor={item => item.id}
                            bounces={false}
                            ItemSeparatorComponent={ItemsSeparator}
                            renderItem={({ item }) => (
                                <CardListItem
                                    testID={`SELF_CUSTODY_OPTIONS_${item.id.toUpperCase()}`}
                                    icon={item.icon as IconKey}
                                    title={item.title}
                                    subtitle={item.description}
                                    action={item.action}
                                />
                            )}
                        />
                    </Animated.View>
                )}

                {navigationState === "social" && <SocialWalletOptions onClose={onClose} />}

                {navigationState === "import" && <ImportWalletOptions onClose={onClose} />}
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootSheet: {
            backgroundColor: theme.colors.newBottomSheet.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        rootSheetContent: {
            transformOrigin: "top center",
        },
        titleContainer: {
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
        },
        closeButton: {
            position: "absolute",
            right: -8,
            top: -16,
            borderRadius: 99,
            padding: 8,
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            zIndex: 5,
        },
    })
