import { useNavigation } from "@react-navigation/native"
import Lottie from "lottie-react-native"
import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import { LoaderDark } from "~Assets"
import {
    BaseIcon,
    BaseText,
    BaseTouchableBox,
    BaseView,
    CardWithHeader,
    CloudKitWarningBottomSheet,
    showErrorToast,
} from "~Components"
import { COLORS, ColorThemeType, DerivationPath } from "~Constants"
import { useBottomSheetModal, useCloudBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { setDeviceIsBackup, useAppDispatch } from "~Storage/Redux"
import { AddressUtils, CryptoUtils, DateUtils, HexUtils, PasswordUtils, PlatformUtils } from "~Utils"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const { LL, locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(PlatformUtils.isIOS())
    const [backupVerified, setBackupVerified] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { saveWalletToCloud, getWalletByRootAddress } = useCloudBackup()

    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()

    const getWallet = useCallback(async () => {
        setIsLoading(true)
        const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
        setIsLoading(false)
        setIsWalletBackedUp(!!wallet)
        setBackupVerified(true)
    }, [deviceToBackup?.rootAddress, getWalletByRootAddress])

    useEffect(() => {
        PlatformUtils.isIOS() && getWallet()
    }, [getWallet])

    const onHandleBackupToCloudKit = useCallback(
        async (password: string) => {
            setIsLoading(true)
            onCloseWarning()

            if (!deviceToBackup?.xPub) {
                showErrorToast({
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
                return
            }

            const firstAccountAddress = AddressUtils.getAddressFromXPub(deviceToBackup.xPub, 0)
            const salt = HexUtils.generateRandom(256)
            const iv = PasswordUtils.getRandomIV(16)
            const mnemonic = await CryptoUtils.encrypt(mnemonicArray, password, salt, iv)
            const isResultOk = await saveWalletToCloud({
                mnemonic,
                _rootAddress: deviceToBackup?.rootAddress,
                deviceType: deviceToBackup?.type,
                firstAccountAddress,
                salt,
                iv,
                derivationPath: deviceToBackup?.derivationPath ?? DerivationPath.VET,
            })

            setIsLoading(false)

            if (isResultOk) {
                setIsWalletBackedUp(true)

                const formattedDate = DateUtils.formatDateTime(
                    Date.now(),
                    locale,
                    getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
                )
                dispatch(
                    setDeviceIsBackup({
                        rootAddress: deviceToBackup.rootAddress,
                        isBackup: true,
                        date: formattedDate,
                    }),
                )
                nav.goBack()
            } else {
                setBackupVerified(false)
            }
        },
        [
            LL,
            deviceToBackup?.derivationPath,
            deviceToBackup?.rootAddress,
            deviceToBackup?.type,
            deviceToBackup?.xPub,
            dispatch,
            locale,
            mnemonicArray,
            nav,
            onCloseWarning,
            saveWalletToCloud,
        ],
    )

    const cardLabel = useMemo(() => {
        if (PlatformUtils.isIOS()) {
            return LL.ICLOUD()
        } else {
            return !backupVerified ? LL.BTN_VERIFY_DRIVE_BACKUP() : LL.GOOGLE_DRIVE()
        }
    }, [LL, backupVerified])

    const cardAction = useCallback(() => {
        if (PlatformUtils.isAndroid() && !backupVerified) {
            getWallet()
        } else {
            onOpen()
        }
    }, [backupVerified, getWallet, onOpen])

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
                    <BaseTouchableBox
                        containerStyle={[
                            styles.cloudRow,
                            {
                                backgroundColor:
                                    isWalletBackedUp || isLoading ? theme.colors.successBackground : COLORS.LIME_GREEN,
                                borderColor:
                                    isWalletBackedUp || isLoading ? theme.colors.successBackground : COLORS.LIME_GREEN,
                            },
                        ]}
                        disabled={isWalletBackedUp || isLoading}
                        style={styles.cloudRowContent}
                        action={cardAction}>
                        <BaseView style={styles.cloudInfo}>
                            <BaseText typographyFont="bodyMedium" color={COLORS.DARK_PURPLE}>
                                {cardLabel}
                            </BaseText>
                        </BaseView>

                        {isLoading ? (
                            <Lottie source={LoaderDark} autoPlay loop style={styles.lottie} />
                        ) : (
                            !isWalletBackedUp && <BaseIcon name="chevron-right" size={14} color={COLORS.DARK_PURPLE} />
                        )}
                    </BaseTouchableBox>
                </CardWithHeader>
            </BaseView>
            <CloudKitWarningBottomSheet
                ref={warningRef}
                onHandleBackupToCloudKit={onHandleBackupToCloudKit}
                openLocation="Backup_Screen"
            />
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        cloudRow: {
            borderRadius: 8,
            borderWidth: 1,
            padding: 0,
        },
        cloudRowContent: {
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 14,
            paddingRight: 12,
            paddingVertical: 10,
        },
        cloudInfo: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        verifyCloudText: {
            paddingLeft: 12,
            color: COLORS.DARK_PURPLE,
        },
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
