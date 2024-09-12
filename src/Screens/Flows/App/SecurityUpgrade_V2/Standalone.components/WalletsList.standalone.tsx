import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Wallet } from "~Model"
import { ListMnemonicCard } from "./ListMnemonicCard.standalone"

type Props = {
    wallets: Wallet[]
    onSelected: (selectedWallet: Wallet) => void
}

export const WalletsList = ({ wallets, onSelected }: Props) => {
    const { LL } = useI18nContext()
    const accountsListSeparator = useCallback(() => <BaseSpacer height={16} />, [])
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView bg={theme.colors.background}>
            <BaseView flexDirection="row">
                <BaseText pt={12} px={24} typographyFont="title">
                    {LL.SB_BACKUP_MNEMONIC()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={24} />
            {!!wallets?.length && (
                <FlatList
                    data={wallets}
                    contentContainerStyle={styles.container}
                    keyExtractor={device => device.rootAddress}
                    ItemSeparatorComponent={accountsListSeparator}
                    renderItem={({ item }) => <ListMnemonicCard onSelected={onSelected} wallet={item} />}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: "100%",
            flexGrow: 1,
            paddingHorizontal: 24,
            backgroundColor: theme.colors.background,
        },
    })
