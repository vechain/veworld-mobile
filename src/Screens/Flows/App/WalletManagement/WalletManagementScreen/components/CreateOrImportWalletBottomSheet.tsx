import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseSpacer, BaseText, BaseView, CardListItem } from "~Components"
import { AnalyticsEvent, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useCloudBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CloudKitWallet, DriveWallet, IconKey } from "~Model"
import { Routes } from "~Navigation"
import { selectHasOnboarded, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"

type Props = {
    onClose: () => void
    handleOnCreateWallet: () => void
}

export const CreateOrImportWalletBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, handleOnCreateWallet }, ref) => {
        const [wallets, setWallets] = useState<CloudKitWallet[] | DriveWallet[]>([])

        const { LL } = useI18nContext()
        const nav = useNavigation()
        const { styles } = useThemedStyles(baseStyles)
        const track = useAnalyticTracking()
        const userHasOnboarded = useAppSelector(selectHasOnboarded)
        const { isCloudAvailable, getAllWalletFromCloud } = useCloudBackup()

        useEffect(() => {
            const init = async () => {
                const _wallets = await getAllWalletFromCloud()
                setWallets(_wallets)
            }

            if (isCloudAvailable && PlatformUtils.isIOS()) init()
        }, [isCloudAvailable, getAllWalletFromCloud])

        const navigateToImportFromCloud = useCallback(() => {
            track(AnalyticsEvent.SELECT_WALLET_IMPORT_CLOUD)
            onClose()
            nav.navigate(Routes.IMPORT_FROM_CLOUD, { wallets })
        }, [nav, onClose, track, wallets])

        const navigateToImportLocalWallet = useCallback(() => {
            track(AnalyticsEvent.SELECT_WALLET_IMPORT_MNEMONIC)
            onClose()
            nav.navigate(Routes.IMPORT_MNEMONIC)
        }, [nav, onClose, track])

        const navigateToImportHardwareWallet = useCallback(() => {
            track(AnalyticsEvent.SELECT_WALLET_IMPORT_HARDWARE)
            onClose()
            nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_DEVICE)
        }, [track, onClose, nav])

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
                    id: "create",
                    title: LL.SB_TITLE_CREATE_WALLET(),
                    description: LL.SB_DESCRIPTION_CREATE_WALLET(),
                    icon: "icon-plus-circle",
                    action: handleOnCreateWallet,
                },
                {
                    id: "cloud",
                    title: LL.SB_TITLE_IMPORT_FROM_CLOUD(),
                    description: LL.SB_DESCRIPTION_IMPORT_FROM_CLOUD(),
                    icon: "icon-cloud",
                    action: navigateToImportFromCloud,
                },
                {
                    id: "import",
                    title: LL.SB_TITLE_IMPORT_WITH_KEYS(),
                    description: LL.SB_DESCRIPTION_IMPORT_WITH_KEYS(),
                    icon: "icon-phrase",
                    action: navigateToImportLocalWallet,
                },
                {
                    id: "hardware",
                    title: LL.SB_TITLE_IMPORT_HARDWARE(),
                    description: LL.SB_DESCRIPTION_IMPORT_HARDWARE(),
                    icon: "icon-ledger",
                    action: navigateToImportHardwareWallet,
                },
                {
                    id: "observe",
                    title: LL.BTN_OBSERVE_WALLET(),
                    description: LL.BTN_OBSERVE_WALLET_SUBTITLE(),
                    icon: "icon-eye",
                    action: onObserveWallet,
                },
            ]
        }, [
            LL,
            handleOnCreateWallet,
            navigateToImportFromCloud,
            navigateToImportLocalWallet,
            navigateToImportHardwareWallet,
            onObserveWallet,
        ])

        const ItemsSeparator = useCallback(() => {
            return <BaseSpacer height={16} />
        }, [])

        const avaliableOptions = useMemo(() => {
            return options.filter(option => {
                if (option.id === "observe") {
                    return userHasOnboarded
                }
                if (option.id === "cloud") {
                    return PlatformUtils.isIOS()
                }
                return true
            })
        }, [options, userHasOnboarded])

        return (
            <BaseBottomSheet dynamicHeight ref={ref} scrollable={false} floating backgroundStyle={styles.rootSheet}>
                <BaseView flexDirection="column" w={100}>
                    <BaseText typographyFont="subTitleBold">{LL.TITLE_CREATE_WALLET_TYPE()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body">{LL.BD_CREATE_WALLET_TYPE()}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <FlatList
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
    })
