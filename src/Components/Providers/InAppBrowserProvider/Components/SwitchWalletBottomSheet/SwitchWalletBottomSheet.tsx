import { default as React, useCallback, useMemo, useRef } from "react"
import { SectionListData, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { BaseSectionListSeparatorProps, SectionListSeparator } from "~Components/Reusable"
import { BottomSheetSectionList } from "~Components/Reusable/BottomSheetLists"
import { SelectableAccountCard } from "~Components/Reusable/SelectableAccountCard"
import { useBottomSheetModal, useSetSelectedAccount, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, SwitchWalletRequest, WalletRequest, WatchedAccount } from "~Model"
import { selectSelectedAccountOrNull, selectVisibleAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { DappWithDetails } from "../DappWithDetails"

type Props = {
    request: SwitchWalletRequest | WalletRequest
    onConfirm: (args: { request: SwitchWalletRequest | WalletRequest; selectedAddress: string }) => Promise<void>
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />
const SectionSeparatorComponent = (props: BaseSectionListSeparatorProps) => {
    return <SectionListSeparator {...props} headerToHeaderHeight={24} headerToItemsHeight={8} />
}

const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <BaseText typographyFont="bodyMedium">{section.alias}</BaseText>
}

const SwitchWalletBottomSheetContent = ({ request, onConfirm }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)

    const sections = useMemo(() => {
        const groupedAccounts = visibleAccounts.reduce((acc, curr) => {
            const key = curr.device?.alias ?? curr.alias
            return { ...acc, [key]: [...(acc[key] ?? []), curr] }
        }, {} as { [alias: string]: AccountWithDevice[] })
        return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
    }, [visibleAccounts])

    const handleConfirm = useCallback(
        (account: AccountWithDevice | WatchedAccount) => {
            if (AccountUtils.isObservedAccount(account)) return
            onConfirm({ request, selectedAddress: account.address })
        },
        [onConfirm, request],
    )

    return (
        <>
            <BaseView pb={12}>
                <BaseView
                    flexDirection="row"
                    gap={12}
                    justifyContent="space-between"
                    testID="SWITCH_WALLET_REQUEST_TITLE">
                    <BaseView flex={1} flexDirection="row" gap={12}>
                        <BaseIcon name="icon-wallet" size={20} color={theme.colors.editSpeedBs.title} />
                        <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                            {LL.SWITCH_WALLET_REQUEST_TITLE()}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseSpacer height={12} />
                <DappWithDetails appName={request.appName} appUrl={request.appUrl} renderDetailsButton={false} />
            </BaseView>
            <BottomSheetSectionList
                sections={sections}
                keyExtractor={item => item.address}
                renderSectionHeader={SectionHeader}
                stickySectionHeadersEnabled={false}
                renderItem={({ item }) => (
                    <SelectableAccountCard
                        account={item}
                        onPress={handleConfirm}
                        selected={item.address === selectedAccount?.address}
                        balanceToken={"VET"}
                        testID="SWITCH_WALLET_ACCOUNT_BOX"
                    />
                )}
                ItemSeparatorComponent={ItemSeparatorComponent}
                SectionSeparatorComponent={SectionSeparatorComponent}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled
                style={styles.list}
            />
        </>
    )
}

const SNAP_POINTS = ["85%"]

export const SwitchWalletBottomSheet = () => {
    const { switchWalletBsRef, switchWalletBsData, setSwitchWalletBsData } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: switchWalletBsRef })

    const { postMessage } = useInAppBrowser()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const isUserAction = useRef(false)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const onConfirm = useCallback(
        async ({
            request,
            selectedAddress,
        }: {
            request: SwitchWalletRequest | WalletRequest
            selectedAddress: string
        }) => {
            onSetSelectedAccount({ address: selectedAddress })
            postMessage({ id: request.id, data: selectedAddress, method: request.method })
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, onSetSelectedAccount, postMessage],
    )

    const rejectRequest = useCallback(
        async (request: SwitchWalletRequest | WalletRequest) => {
            if (request.method === "thor_switchWallet")
                return postMessage({
                    id: request.id,
                    data: selectedAccount?.address ?? "",
                    method: request.method,
                })
            return postMessage({
                id: request.id,
                data: null,
                method: request.method,
            })
        },
        [postMessage, selectedAccount?.address],
    )

    const onDismiss = useCallback(async () => {
        if (isUserAction.current) {
            setSwitchWalletBsData(null)
            isUserAction.current = false
            return
        }
        if (!switchWalletBsData) return
        await rejectRequest(switchWalletBsData)
        isUserAction.current = false
        setSwitchWalletBsData(null)
    }, [switchWalletBsData, rejectRequest, setSwitchWalletBsData])

    return (
        <BaseBottomSheet<Request>
            ref={switchWalletBsRef}
            onDismiss={onDismiss}
            enableContentPanningGesture={false}
            scrollable={false}
            snapPoints={SNAP_POINTS}>
            {switchWalletBsData && (
                <SwitchWalletBottomSheetContent onConfirm={onConfirm} request={switchWalletBsData} />
            )}
        </BaseBottomSheet>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        list: {
            flex: 1,
        },
    })
