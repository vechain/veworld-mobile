import React, { useEffect, useState } from "react"
import { getTimeZone } from "react-native-localize"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components/Base"
import { ColorThemeType, DerivationPath, VET } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CloudKitWallet } from "~Model"
import { selectDevices, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils, DateUtils, PlatformUtils } from "~Utils"
import { AccountIcon } from "./Account"
import { StyleSheet } from "react-native"

export const CloudKitWalletCard = ({
    wallet,
    selected,
}: {
    wallet: CloudKitWallet
    selected: CloudKitWallet | null
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { getVnsName } = useVns()
    const network = useAppSelector(selectSelectedNetwork)
    const { locale } = useI18nContext()
    const devices = useAppSelector(selectDevices)
    const [isImported, setisImported] = useState(false)

    useEffect(() => {
        devices.forEach(device => {
            if (device.rootAddress === wallet.rootAddress) {
                setisImported(true)
            }
        })
    }, [devices, wallet.rootAddress])

    const [nameOrAddress, setNameOrAddress] = useState(wallet.firstAccountAddress)
    useEffect(() => {
        const init = async () => {
            const vnsName = await getVnsName(wallet.firstAccountAddress)
            if (vnsName) {
                setNameOrAddress(vnsName)
            } else {
                setNameOrAddress(AddressUtils.humanAddress(wallet.firstAccountAddress, 4, 6))
            }
        }
        init()
    }, [getVnsName, wallet.firstAccountAddress])

    const [balance, setBalance] = useState("0")
    useEffect(() => {
        const init = async () => {
            const _balance = await BalanceUtils.getVetAndVthoBalancesFromBlockchain(wallet.firstAccountAddress, network)
            const formattedBalance = BigNutils(_balance.balance).toHuman(VET.decimals).toTokenFormat_string(2)
            setBalance(formattedBalance)
        }
        init()
    }, [network, wallet.firstAccountAddress])

    const [creationDate, setCreationDate] = useState("...")
    useEffect(() => {
        const date = DateUtils.formatDateTime(
            Number(wallet.creationDate.toFixed(0)) * 1000,
            locale,
            getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
        )
        setCreationDate(date)
    }, [locale, wallet.creationDate])

    return (
        <BaseView w={100} flexDirection="row">
            <BaseTouchableBox
                disabled={isImported}
                haptics="Light"
                justifyContent="space-between"
                containerStyle={[
                    styles.container,
                    selected?.rootAddress === wallet.rootAddress ? styles.selectedContainer : {},
                ]}>
                <BaseView flexDirection="row" pr={10} alignItems="center">
                    <AccountIcon address={wallet.firstAccountAddress} />
                    <BaseSpacer width={12} />

                    <BaseView justifyContent="space-between">
                        <BaseView flexDirection="row">
                            <BaseView alignSelf="flex-start" alignItems="flex-start">
                                <BaseView flexDirection="row" style={styles.icloudTag}>
                                    <BaseIcon
                                        size={18}
                                        name={PlatformUtils.isIOS() ? "icon-cloud" : "icon-google-drive"}
                                        color={theme.colors.textReversed}
                                        style={styles.cloudIcon}
                                    />
                                    <BaseText fontSize={12} color={theme.colors.textReversed}>
                                        {PlatformUtils.isIOS() ? "iCloud" : "Google Drive"}
                                    </BaseText>
                                </BaseView>
                            </BaseView>

                            {wallet.derivationPath === DerivationPath.ETH && (
                                <>
                                    <BaseSpacer width={4} />
                                    <BaseIcon name="icon-ethereum" size={20} color={theme.colors.primaryDisabled} />
                                </>
                            )}
                        </BaseView>

                        <BaseSpacer height={4} />

                        <BaseText style={styles.address} fontSize={10}>
                            {creationDate}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseView style={styles.rightSubContainer}>
                    <BaseText style={styles.address} fontSize={10}>
                        {nameOrAddress}
                    </BaseText>

                    <BaseSpacer height={4} />
                    <BaseText fontSize={10}>
                        {balance} {VET.symbol.toUpperCase()}
                    </BaseText>
                </BaseView>
            </BaseTouchableBox>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        address: {
            opacity: 0.7,
        },
        container: {
            flex: 1,
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.border,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        cloudIcon: {
            marginRight: 4,
        },
        icloudTag: {
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: theme.colors.primary,
        },
    })
