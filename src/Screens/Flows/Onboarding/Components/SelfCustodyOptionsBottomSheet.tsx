import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { RefObject, useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { CardListItem, CreatePasswordModal } from "~Components/Reusable"
import { AnalyticsEvent, ColorThemeType, DerivationPath } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useCloudBackup } from "~Hooks/useCloudBackup"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n/i18n-react"
import { CloudKitWallet, DrivetWallet, IconKey } from "~Model"
import { Routes } from "~Navigation/Enums"
import { PlatformUtils } from "~Utils"
import { useHandleWalletCreation } from "../WelcomeScreen/useHandleWalletCreation"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
}

export const SelfCustodyOptionsBottomSheet = ({ bsRef }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const [wallets, setWallets] = useState<CloudKitWallet[] | DrivetWallet[]>([])

    const { ref: bottomSheetRef, onClose } = useBottomSheetModal({ externalRef: bsRef })
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { isCloudAvailable, getAllWalletFromCloud } = useCloudBackup()
    const { onCreateWallet, isOpen, isError, onSuccess, onClose: onCloseCreateFlow } = useHandleWalletCreation()

    const isCloudBackupAvailable = useMemo(() => {
        return PlatformUtils.isIOS() && isCloudAvailable && Boolean(wallets.length) && !isLoading
    }, [isCloudAvailable, wallets.length, isLoading])

    const onNewWallet = useCallback(async () => {
        track(AnalyticsEvent.SELECT_WALLET_CREATE_WALLET)
        await onCreateWallet({ derivationPath: DerivationPath.VET })
        onClose()
    }, [onCreateWallet, track, onClose])

    const goToImportFromCloud = useCallback(() => {
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_CLOUD)
        onClose()
        nav.navigate(Routes.IMPORT_FROM_CLOUD, { wallets })
    }, [nav, wallets, onClose, track])

    const goToImportWithKeys = useCallback(() => {
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_MNEMONIC)
        onClose()
        nav.navigate(Routes.IMPORT_MNEMONIC)
    }, [nav, onClose, track])

    const goToImportHardwareWallet = useCallback(() => {
        track(AnalyticsEvent.SELECT_WALLET_IMPORT_HARDWARE)
        onClose()
        nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_DEVICE)
    }, [nav, onClose, track])

    const options = useMemo(() => {
        return [
            {
                id: "create",
                title: LL.SB_TITLE_CREATE_WALLET(),
                description: LL.SB_DESCRIPTION_CREATE_WALLET(),
                icon: "icon-plus-circle",
                action: () => onNewWallet(),
            },
            {
                id: "cloud",
                title: LL.SB_TITLE_IMPORT_FROM_CLOUD(),
                description: LL.SB_DESCRIPTION_IMPORT_FROM_CLOUD(),
                icon: "icon-cloud",
                disabled: !isCloudBackupAvailable,
                action: goToImportFromCloud,
            },
            {
                id: "import",
                title: LL.SB_TITLE_IMPORT_WITH_KEYS(),
                description: LL.SB_DESCRIPTION_IMPORT_WITH_KEYS(),
                icon: "icon-phrase",
                action: goToImportWithKeys,
            },
            {
                id: "hardware",
                title: LL.SB_TITLE_IMPORT_HARDWARE(),
                description: LL.SB_DESCRIPTION_IMPORT_HARDWARE(),
                icon: "icon-ledger",
                action: goToImportHardwareWallet,
            },
        ]
    }, [isCloudBackupAvailable, goToImportFromCloud, goToImportWithKeys, goToImportHardwareWallet, onNewWallet, LL])

    const avaliableOptions = useMemo(() => {
        //Do not show cloud backup option on Android
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

    useEffect(() => {
        const init = async () => {
            const _wallets = await getAllWalletFromCloud()
            setWallets(_wallets)
            setIsLoading(false)
        }

        isCloudAvailable && PlatformUtils.isIOS() && init()
    }, [isCloudAvailable, getAllWalletFromCloud])

    useEffect(() => {
        if (isError) {
            Feedback.show({
                severity: FeedbackSeverity.ERROR,
                type: FeedbackType.ALERT,
                message: LL.ERROR_CREATING_WALLET(),
            })
        }
    }, [isError, LL])

    return (
        <BaseBottomSheet
            ref={bottomSheetRef}
            floating
            dynamicHeight
            scrollable={false}
            backgroundStyle={styles.rootSheet}
            enablePanDownToClose>
            {/* Title and description */}
            <BaseView gap={8}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-wallet" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SB_TITLE_SELF_CUSTODY_WALLET()}
                    </BaseText>
                </BaseView>
                <BaseText typographyFont="body" color={theme.colors.editSpeedBs.subtitle}>
                    {LL.SB_DESCRIPTION_SELF_CUSTODY_WALLET()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={16} />
            {/* Options */}
            <FlatList
                data={avaliableOptions}
                keyExtractor={option => option.id}
                bounces={false}
                renderItem={({ item }) => (
                    <CardListItem
                        icon={item.icon as IconKey}
                        title={item.title}
                        subtitle={item.description}
                        action={item.action}
                        disabled={item.disabled ?? false}
                    />
                )}
                ItemSeparatorComponent={ItemsSeparator}
            />
            <CreatePasswordModal
                isOpen={isOpen}
                onClose={onCloseCreateFlow}
                onSuccess={pin =>
                    onSuccess({
                        pin,
                        derivationPath: DerivationPath.VET,
                    })
                }
            />
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        rootSheet: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
    })
}
