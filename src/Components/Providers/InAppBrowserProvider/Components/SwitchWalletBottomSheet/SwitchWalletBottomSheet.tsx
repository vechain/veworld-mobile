import { default as React, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SectionList, SectionListData, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { SelectableAccountCard } from "~Components/Reusable/SelectableAccountCard"
import { SCREEN_HEIGHT } from "~Constants"
import { useBottomSheetModal, useSetSelectedAccount, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, SwitchWalletRequest, WalletRequest, WatchedAccount } from "~Model"
import { selectSelectedAccountOrNull, selectVisibleAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { DappWithDetails } from "../DappWithDetails"

type Props = {
    request: SwitchWalletRequest | WalletRequest
    onCancel: (request: SwitchWalletRequest | WalletRequest) => Promise<void>
    onConfirm: (args: { request: SwitchWalletRequest | WalletRequest; selectedAddress: string }) => Promise<void>
    /**
     * Triggered when onLayout is called
     * @param newValue True when it's small, false when it isn't
     * @returns
     */
    onResize: (newValue: boolean) => void
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <BaseText typographyFont="bodyMedium">{section.alias}</BaseText>
}

const SwitchWalletBottomSheetContent = ({ request, onCancel, onConfirm, onResize }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const [internalAccount, setInternalAccount] = useState(selectedAccount)

    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const [height, setHeight] = useState(SCREEN_HEIGHT)
    const initialLayout = useRef(false)

    const sections = useMemo(() => {
        const groupedAccounts = visibleAccounts.reduce((acc, curr) => {
            const key = curr.device?.alias ?? curr.alias
            return { ...acc, [key]: [...(acc[key] ?? []), curr] }
        }, {} as { [alias: string]: AccountWithDevice[] })
        return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
    }, [visibleAccounts])

    const handlePress = useCallback((account: AccountWithDevice | WatchedAccount) => {
        if (AccountUtils.isObservedAccount(account)) return
        setInternalAccount(account)
    }, [])

    const handleConfirm = useCallback(() => {
        onConfirm({ request, selectedAddress: internalAccount?.address ?? "" })
    }, [internalAccount?.address, onConfirm, request])

    return (
        <>
            <BaseView flexDirection="row" gap={12} justifyContent="space-between" testID="SWITCH_WALLET_REQUEST_TITLE">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-wallet" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SWITCH_WALLET_REQUEST_TITLE()}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseSpacer height={12} />
            <DappWithDetails appName={request.appName} appUrl={request.appUrl} renderDetailsButton={false} />
            <BaseSpacer height={12} />

            <SectionList
                sections={sections}
                keyExtractor={item => item.address}
                renderSectionHeader={SectionHeader}
                stickySectionHeadersEnabled={false}
                renderItem={({ item }) => (
                    <SelectableAccountCard
                        account={item}
                        onPress={handlePress}
                        selected={item.address === internalAccount?.address}
                        balanceToken={"VET"}
                        testID="selectAccount"
                    />
                )}
                ItemSeparatorComponent={ItemSeparatorComponent}
                SectionSeparatorComponent={ItemSeparatorComponent}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={(_, contentHeight) => {
                    if (contentHeight <= height) {
                        onResize(true)
                        setHeight(contentHeight)
                    } else {
                        onResize(false)
                    }
                }}
                onLayout={e => {
                    const _height = e.nativeEvent.layout.height
                    if (initialLayout.current) return

                    if (_height < SCREEN_HEIGHT) {
                        setHeight(_height)
                        initialLayout.current = true
                    }
                }}
                scrollEnabled
                style={{ maxHeight: height }}
            />
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16} mb={isIOS() ? 16 : 0}>
                <BaseButton
                    action={onCancel.bind(null, request)}
                    variant="outline"
                    flex={1}
                    testID="SWITCH_WALLET_REQUEST_BTN_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton
                    action={handleConfirm}
                    flex={1}
                    disabled={AccountUtils.isObservedAccount(internalAccount) || !internalAccount}
                    testID="SWITCH_WALLET_REQUEST_BTN_SIGN">
                    {LL.SWITCH_WALLET_REQUEST_CTA()}
                </BaseButton>
            </BaseView>
        </>
    )
}

export const SwitchWalletBottomSheet = () => {
    const { switchWalletBsRef, switchWalletBsData, setSwitchWalletBsData } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: switchWalletBsRef })

    const { postMessage } = useInAppBrowser()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const isUserAction = useRef(false)

    const [smallViewport, setSmallViewport] = useState(false)

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

    const onCancel = useCallback(
        async (request: SwitchWalletRequest | WalletRequest) => {
            await rejectRequest(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectRequest],
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

    useEffect(() => {
        if (switchWalletBsData === null) setSmallViewport(false)
    }, [switchWalletBsData])

    return (
        <BaseBottomSheet<Request>
            dynamicHeight
            ref={switchWalletBsRef}
            onDismiss={onDismiss}
            enableContentPanningGesture={false}
            contentStyle={smallViewport ? undefined : styles.root}>
            {switchWalletBsData && (
                <SwitchWalletBottomSheetContent
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                    request={switchWalletBsData}
                    onResize={setSmallViewport}
                />
            )}
        </BaseBottomSheet>
    )
}

const styles = StyleSheet.create({
    root: {
        height: "100%",
    },
})
