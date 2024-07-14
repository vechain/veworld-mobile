import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { AccountIcon, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView, Layout } from "~Components"
import { ColorThemeType } from "~Constants"
import { useCloudKit, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AddressUtils } from "~Utils"

type ClpudKitWallet = {
    data: string
    rootAddress: string
    walletType: string
    salt: string
}

export const ImportFromCloudScreen = () => {
    const { getAllWalletsFromCloudKit } = useCloudKit()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const [CcoudKitWallets, setCloudKitWallets] = useState<ClpudKitWallet[] | null>(null)
    const [selected, setSelected] = useState<ClpudKitWallet | null>(null)

    useEffect(() => {
        const init = async () => {
            const wallets = await getAllWalletsFromCloudKit()
            setCloudKitWallets(wallets)
        }

        init()
    }, [getAllWalletsFromCloudKit])

    const handleOnPress = useCallback((wallet: ClpudKitWallet) => {
        setSelected(wallet)
    }, [])

    return (
        <Layout
            fixedHeader={<BaseText typographyFont="title">{LL.TITLE_IMPORT_WALLET_FROM_ICLOUD()}</BaseText>}
            body={
                <BaseView>
                    {CcoudKitWallets &&
                        CcoudKitWallets.map(wallet => {
                            return (
                                <BaseView w={100} flexDirection="row" style={styles.contanier}>
                                    <BaseTouchableBox
                                        haptics="Light"
                                        action={() => handleOnPress(wallet)}
                                        justifyContent="space-between"
                                        containerStyle={[
                                            styles.container,
                                            selected?.rootAddress === wallet.rootAddress
                                                ? styles.selectedContainer
                                                : {},
                                        ]}>
                                        <BaseView flexDirection="row" pr={10}>
                                            <AccountIcon address={wallet.rootAddress} />
                                            <BaseSpacer width={12} />

                                            <BaseView alignSelf="flex-start">
                                                <BaseView flexDirection="row" style={styles.icloudTag}>
                                                    <BaseIcon
                                                        size={20}
                                                        name="apple-icloud"
                                                        color={theme.colors.disabledButton}
                                                        style={styles.cloudIcon}
                                                    />
                                                    <BaseText fontSize={12}>{"iCloud"}</BaseText>
                                                </BaseView>
                                            </BaseView>
                                        </BaseView>

                                        <BaseView style={styles.rightSubContainer}>
                                            <BaseText style={styles.address} fontSize={10}>
                                                {AddressUtils.humanAddress(wallet.rootAddress, 4, 6)}
                                            </BaseText>

                                            <BaseSpacer height={4} />
                                            <BaseText fontSize={10}>{"3000000 VET"}</BaseText>
                                        </BaseView>
                                    </BaseTouchableBox>
                                </BaseView>
                            )
                        })}
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        contanier: {
            marginVertical: 8,
        },
        wallet: {
            opacity: 0.7,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            flex: 1,
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        eyeIcon: { marginLeft: 16, flex: 0.1 },

        cloudIcon: {
            marginRight: 4,
        },

        icloudTag: {
            color: theme.colors.text,
            borderColor: theme.colors.text,
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: 4,
        },
    })
