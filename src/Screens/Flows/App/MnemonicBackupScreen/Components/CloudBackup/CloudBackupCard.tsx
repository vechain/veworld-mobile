import { useFocusEffect, useNavigation } from "@react-navigation/native"
import Lottie from "lottie-react-native"
import React, { FC, useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { LoaderDark, LoaderLight } from "~Assets"
import { BaseIcon, BaseText, BaseView, CardWithHeader, WalletBackupStatusRow } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useCloudBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { Routes } from "~Navigation"
import { selectAccounts, selectIsAppLoading, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const navigation = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const isAppLoading = useAppSelector(selectIsAppLoading)
    const accounts = useAppSelector(selectAccounts)

    const [isWalletBackedUp, setIsWalletBackedUp] = useState(true)
    const [isCloudError, setIsCloudError] = useState(false)

    const { getWalletByRootAddress } = useCloudBackup()

    const getWallet = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        try {
            const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
            setIsWalletBackedUp(!!wallet)
            setIsCloudError(false)
        } catch {
            setIsWalletBackedUp(false)
            setIsCloudError(true)
        } finally {
            dispatch(setIsAppLoading(false))
        }
    }, [deviceToBackup?.rootAddress, dispatch, getWalletByRootAddress])

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
        } else {
            if (deviceToBackup) {
                navigation.navigate(Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD, {
                    mnemonicArray,
                    device: deviceToBackup,
                })
            }
        }
    }, [deviceToBackup, dispatch, getWalletByRootAddress, isCloudError, mnemonicArray, navigation])

    return (
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
                            !isWalletBackedUp && <BaseIcon name="chevron-right" size={14} color={COLORS.DARK_PURPLE} />
                        )
                    }
                    onPress={goToChoosePasswordScreen}
                    disabled={isWalletBackedUp || isAppLoading}
                    loading={isAppLoading}
                />
            </CardWithHeader>
        </BaseView>
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
