import { useFocusEffect, useNavigation } from "@react-navigation/native"
import Lottie from "lottie-react-native"
import React, { FC, useCallback } from "react"
import { StyleSheet } from "react-native"
import { LoaderDark, LoaderLight } from "~Assets"
import {
    BaseIcon,
    BaseText,
    BaseView,
    CardWithHeader,
    ConfirmDeleteCloudBackupBottomSheet,
    DeleteCloudBackupBottomSheet,
    RequireUserPassword,
    WalletBackupStatusRow,
} from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import {
    useBiometricsValidation,
    useBottomSheetModal,
    useCheckIdentity,
    useCloudBackup,
    useThemedStyles,
    useWalletSecurity,
} from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { Routes } from "~Navigation"
import { selectAccounts, selectIsAppLoading, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { useCloudBackupDelete, useCloudBackupState } from "../../Hooks"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const { LL, locale } = useI18nContext()
    const navigation = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const isAppLoading = useAppSelector(selectIsAppLoading)
    const accounts = useAppSelector(selectAccounts)

    const { getWalletByRootAddress, deleteWallet } = useCloudBackup()

    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()

    const { isWalletBackedUp, setIsWalletBackedUp, isCloudError, setIsCloudError, getWallet } = useCloudBackupState(
        deviceToBackup,
        getWalletByRootAddress,
    )

    const { handleConfirmDelete } = useCloudBackupDelete(
        deviceToBackup,
        deleteWallet,
        getWalletByRootAddress,
        setIsWalletBackedUp,
        setIsCloudError,
        navigation,
        locale,
    )

    const {
        ref: confirmDeleteBackupRef,
        openWithDelay: onOpenConfirmDeleteBackup,
        onClose: onCloseConfirmDeleteBackup,
    } = useBottomSheetModal()
    const { ref: deleteBackupRef, onOpen: onOpenDeleteBackup, onClose: onCloseDeleteBackup } = useBottomSheetModal()

    useFocusEffect(
        useCallback(() => {
            if (!accounts.find(account => account.rootAddress === deviceToBackup?.rootAddress)) {
                navigation.goBack()
            } else {
                getWallet()
            }
        }, [accounts, deviceToBackup?.rootAddress, getWallet, navigation]),
    )

    const goToChoosePasswordScreen = useCallback(async () => {
        if (isCloudError) {
            dispatch(setIsAppLoading(true))
            try {
                const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
                const isBackuped = !!wallet
                setIsWalletBackedUp(isBackuped)
                setIsCloudError(false)

                if (!isBackuped && deviceToBackup) {
                    navigation.navigate(Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD, {
                        mnemonicArray,
                        device: deviceToBackup,
                    })
                }
            } catch {
                setIsWalletBackedUp(false)
                setIsCloudError(true)
            } finally {
                dispatch(setIsAppLoading(false))
            }
        } else if (deviceToBackup) {
            navigation.navigate(Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD, {
                mnemonicArray,
                device: deviceToBackup,
            })
        }
    }, [
        deviceToBackup,
        dispatch,
        getWalletByRootAddress,
        isCloudError,
        mnemonicArray,
        navigation,
        setIsCloudError,
        setIsWalletBackedUp,
    ])

    const handleCloudBackupPress = useCallback(() => {
        if (isWalletBackedUp) {
            onOpenDeleteBackup()
        } else {
            goToChoosePasswordScreen()
        }
    }, [isWalletBackedUp, goToChoosePasswordScreen, onOpenDeleteBackup])

    const handleProceedToDelete = useCallback(() => {
        onCloseDeleteBackup()
        onOpenConfirmDeleteBackup(1000)
    }, [onCloseDeleteBackup, onOpenConfirmDeleteBackup])

    const { onPasswordSuccess, checkIdentityBeforeOpening, isPasswordPromptOpen, handleClosePasswordModal } =
        useCheckIdentity({
            onIdentityConfirmed: async () => await handleConfirmDelete(),
            allowAutoPassword: false,
        })

    const handleConfirmDeleteWithAuth = useCallback(() => {
        if (isWalletSecurityBiometrics) {
            return authenticateBiometrics(handleConfirmDelete)
        }
        return checkIdentityBeforeOpening()
    }, [isWalletSecurityBiometrics, authenticateBiometrics, handleConfirmDelete, checkIdentityBeforeOpening])

    return (
        <>
            <BaseView justifyContent="center">
                <CardWithHeader
                    title={LL.TITLE_BACKUP_CLOUD()}
                    iconName="cloud-outline"
                    sideHeader={
                        <BaseView style={styles.sideHeader}>
                            <BaseText
                                typographyFont="smallCaptionMedium"
                                px={6}
                                py={2}
                                color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}>
                                {LL.RECOMMENDED()}
                            </BaseText>
                        </BaseView>
                    }>
                    <WalletBackupStatusRow
                        variant={isWalletBackedUp ? "success" : "error"}
                        title={PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE()}
                        rightElement={
                            isAppLoading ? (
                                <Lottie
                                    source={theme.isDark ? LoaderDark : LoaderLight}
                                    autoPlay
                                    loop
                                    style={styles.lottie}
                                />
                            ) : (
                                <BaseIcon name="chevron-right" size={14} color={COLORS.DARK_PURPLE} />
                            )
                        }
                        onPress={handleCloudBackupPress}
                        disabled={isAppLoading}
                        loading={isAppLoading}
                    />
                </CardWithHeader>
            </BaseView>

            <DeleteCloudBackupBottomSheet
                ref={deleteBackupRef}
                onClose={onCloseDeleteBackup}
                onProceedToDelete={handleProceedToDelete}
            />

            <ConfirmDeleteCloudBackupBottomSheet
                ref={confirmDeleteBackupRef}
                onClose={onCloseConfirmDeleteBackup}
                onConfirm={handleConfirmDeleteWithAuth}
            />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        sideHeader: {
            borderWidth: 1,
            borderRadius: 4,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300,
            backgroundColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
        },
        lottie: {
            width: 28,
            height: 20,
            marginVertical: -2,
        },
    })
