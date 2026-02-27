import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, StretchInY, StretchOutY } from "react-native-reanimated"
import { BaseSpacer } from "~Components/Base"
import { CardListItem } from "~Components/Reusable"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useCloudBackup } from "~Hooks/useCloudBackup"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { DriveWallet } from "~Model/Cloud/DriveWallet"
import { CloudKitWallet } from "~Model/CloudKitWallet"
import { Routes } from "~Navigation"
import { PlatformUtils } from "~Utils"

type Props = {
    /**
     * Function to close the bottom sheet
     */
    onClose: () => void
}

export const ImportWalletOptions = ({ onClose }: Props) => {
    const [wallets, setWallets] = useState<CloudKitWallet[] | DriveWallet[]>([])
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()

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

    const options = useMemo(() => {
        return [
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
        ]
    }, [LL, navigateToImportFromCloud, navigateToImportLocalWallet, navigateToImportHardwareWallet])

    const filteredOptions = useMemo(() => {
        return options.filter(option => {
            if (option.id === "cloud") {
                return PlatformUtils.isIOS()
            }
            return true
        })
    }, [options])

    const ItemsSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    return (
        <Animated.View
            style={styles.rootSheetContent}
            entering={StretchInY.duration(200)}
            exiting={StretchOutY.duration(200)}
            layout={LinearTransition}>
            <Animated.FlatList
                data={filteredOptions}
                keyExtractor={item => item.id}
                bounces={false}
                ItemSeparatorComponent={ItemsSeparator}
                renderItem={({ item }) => (
                    <CardListItem
                        testID={`IMPORT_WALLET_OPTIONS_${item.id.toUpperCase()}`}
                        icon={item.icon as IconKey}
                        title={item.title}
                        subtitle={item.description}
                        action={item.action}
                    />
                )}
            />
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootSheetContent: {
            transformOrigin: "top center",
        },
    })
