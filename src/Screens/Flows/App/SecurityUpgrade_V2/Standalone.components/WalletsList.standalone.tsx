import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Wallet } from "~Model"
import { ListMnemonicCard } from "./ListMnemonicCard.standalone"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"

type Props = {
    wallets: Wallet[]
    onSelected: (selectedWallet: Wallet) => void
}

export const WalletsList = ({ wallets, onSelected }: Props) => {
    const { LL } = useI18nContext()
    const accountsListSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    return (
        <BaseView bg={COLORS.LIGHT_GRAY}>
            <BaseView flexDirection="row">
                <BaseText pt={12} px={24} typographyFont="subTitleBold">
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

const styles = StyleSheet.create({
    container: {
        height: "100%",
        flexGrow: 1,
        paddingHorizontal: 24,
        backgroundColor: COLORS.LIGHT_GRAY,
    },
})
