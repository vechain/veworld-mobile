import { TouchableOpacity as BSTouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { ComponentProps, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SectionList, SectionListData, StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import {
    BaseBottomSheet,
    BaseIcon,
    BaseSectionListSeparatorProps,
    BaseSpacer,
    BaseText,
    BaseView,
    SectionListSeparator,
} from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useScrollableBottomSheetList, useScrollableBottomSheetListWrapper } from "~Hooks/useScrollableBottomSheetList"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { Routes } from "~Navigation"
import { AccountUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { SelectableAccountCard } from "../SelectableAccountCard"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export enum SelectAccountBottomSheetType {
    PERSONAL = "YOUR_WALLETS",
    WATCHING = "WATCHING",
}

type Props = {
    /**
     * Called on the bottom sheet dismiss
     */
    onDismiss?: () => void
    /**
     * Called to close the bottom sheet
     */
    closeBottomSheet?: () => void
    /**
     * List of accounts to display
     */
    accounts: AccountWithDevice[]
    /**
     * Called when an account is selected
     * @param account New selected account
     */
    setSelectedAccount: (account: AccountWithDevice | WatchedAccount) => void
    /**
     * The selected account
     */
    selectedAccount?: AccountWithDevice
    balanceToken?: ComponentProps<typeof SelectableAccountCard>["balanceToken"]
    /**
     * Enable the functionality go to the wallet section.
     * @default false
     */
    goToWalletEnabled?: boolean
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />
const SectionSeparatorComponent = (props: BaseSectionListSeparatorProps) => {
    return <SectionListSeparator {...props} headerToHeaderHeight={24} headerToItemsHeight={8} />
}

const SectionHeaderTitle = ({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE}>
            {children}
        </BaseText>
    )
}
const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <SectionHeaderTitle>{section.alias}</SectionHeaderTitle>
}

const AnimatedSectionList = Animated.createAnimatedComponent(
    SectionList<
        AccountWithDevice,
        {
            data: AccountWithDevice[]
            alias: string
        }
    >,
)

const ANIMATION_CONFIG = { stiffness: 90, damping: 15, duration: 300 }

// component to select an account
export const SelectAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    (
        {
            closeBottomSheet,
            setSelectedAccount,
            selectedAccount,
            onDismiss,
            accounts,
            balanceToken = "FIAT",
            goToWalletEnabled,
        },
        ref,
    ) => {
        const { LL } = useI18nContext()
        const { bottom } = useSafeAreaInsets()
        const { onResize, contentStyle, setSmallViewport } = useScrollableBottomSheetListWrapper()
        const initialLayout = useRef(false)
        const { resetHeight, ...scrollableListProps } = useScrollableBottomSheetList({ onResize, initialLayout })
        const nav = useNavigation()
        const [selectedKey, setSelectedKey] = useState<SelectAccountBottomSheetType>(
            SelectAccountBottomSheetType.PERSONAL,
        )

        const handlePress = useCallback(
            (account: AccountWithDevice | WatchedAccount) => {
                setSelectedAccount(account)
                if (closeBottomSheet) closeBottomSheet()
            },
            [closeBottomSheet, setSelectedAccount],
        )

        const { styles, theme } = useThemedStyles(baseStyles({ bottomInset: bottom }))

        const sections = useMemo(() => {
            if (selectedKey === SelectAccountBottomSheetType.PERSONAL) {
                const groupedAccounts = accounts
                    .filter(account => !AccountUtils.isObservedAccount(account))
                    .reduce((acc, curr) => {
                        const key = curr.device?.alias ?? curr.alias
                        return { ...acc, [key]: [...(acc[key] ?? []), curr] }
                    }, {} as { [alias: string]: AccountWithDevice[] })
                return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
            }

            return [
                {
                    alias: LL.SELECT_ACCOUNT_TITLE(),
                    data: accounts.filter(AccountUtils.isObservedAccount),
                },
            ]
        }, [LL, accounts, selectedKey])

        const onSettingsClick = useCallback(() => {
            nav.navigate(Routes.WALLET_MANAGEMENT)
            closeBottomSheet?.()
        }, [closeBottomSheet, nav])

        const keys = useMemo(() => {
            const hasObserved = accounts.some(AccountUtils.isObservedAccount)
            return hasObserved
                ? [SelectAccountBottomSheetType.PERSONAL, SelectAccountBottomSheetType.WATCHING]
                : ([SelectAccountBottomSheetType.PERSONAL] as const)
        }, [accounts])

        const labels = useMemo(() => keys.map(key => LL[`SELECT_ACCOUNT_${key}`]()), [LL, keys])

        //Reset the state in order for the BS to fix its size
        useEffect(() => {
            setSmallViewport(false)
            initialLayout.current = false
            resetHeight()
        }, [resetHeight, selectedKey, setSmallViewport])

        const handleDismiss = useCallback(() => {
            setSmallViewport(false)
            initialLayout.current = false
            resetHeight()
            onDismiss?.()
        }, [onDismiss, resetHeight, setSmallViewport])

        return (
            <BaseBottomSheet
                dynamicHeight
                ref={ref}
                onDismiss={handleDismiss}
                contentStyle={contentStyle}
                enableContentPanningGesture={false}
                animationConfigs={ANIMATION_CONFIG}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                    <BaseView flexDirection="column" gap={8}>
                        <BaseView flexDirection="row" alignItems="center" gap={12}>
                            <BaseIcon
                                name="icon-wallet"
                                size={20}
                                color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900}
                            />
                            <BaseText typographyFont="subTitleSemiBold">{LL.SELECT_ACCOUNT_TITLE()}</BaseText>
                        </BaseView>
                        <BaseText typographyFont="caption" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                            {LL.SELECT_ACCOUNT_DESCRIPTION()}
                        </BaseText>
                    </BaseView>
                    {goToWalletEnabled && (
                        <BSTouchableOpacity onPress={onSettingsClick} style={styles.settingsBtn}>
                            <BaseIcon name="icon-settings" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} />
                        </BSTouchableOpacity>
                    )}
                </BaseView>

                <BaseSpacer height={24} />

                {keys.length > 1 && (
                    <>
                        <BaseTabs
                            keys={keys}
                            labels={labels}
                            selectedKey={selectedKey}
                            setSelectedKey={setSelectedKey}
                        />

                        <BaseSpacer height={24} />
                    </>
                )}

                <AnimatedSectionList
                    sections={sections}
                    contentContainerStyle={styles.contentContainer}
                    keyExtractor={item => item.address}
                    renderSectionHeader={SectionHeader}
                    stickySectionHeadersEnabled={false}
                    renderItem={({ item }) => (
                        <SelectableAccountCard
                            account={item}
                            onPress={handlePress}
                            selected={item.address === selectedAccount?.address}
                            balanceToken={balanceToken}
                            testID="selectAccount"
                        />
                    )}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    SectionSeparatorComponent={SectionSeparatorComponent}
                    key={selectedKey}
                    showsVerticalScrollIndicator={false}
                    layout={LinearTransition.duration(500)}
                    initialNumToRender={15}
                    {...scrollableListProps}
                    scrollEnabled
                />
            </BaseBottomSheet>
        )
    },
)
const baseStyles =
    ({ bottomInset }: { bottomInset: number }) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            settingsBtn: {
                backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
                padding: 8,
                borderWidth: 1,
                borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
                borderRadius: 6,
            },
            contentContainer: {
                paddingBottom: bottomInset,
            },
        })
