import { CommonActions, useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseTouchable, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, type WalletAccount } from "~Model"
import { Routes } from "~Navigation"
import {
    selectAccounts,
    selectDevicesState,
    setB3moLinkedAddress,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const B3moPickWalletScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)
    const devices = useAppSelector(selectDevicesState)

    const eligible = useMemo(() => {
        const localDevices = new Set(
            devices.filter(d => d.type === DEVICE_TYPE.LOCAL_MNEMONIC).map(d => d.rootAddress.toLowerCase()),
        )
        return accounts.filter(a => localDevices.has(a.rootAddress.toLowerCase()) && a.visible)
    }, [accounts, devices])

    const onSelect = useCallback(
        (account: WalletAccount) => {
            dispatch(setB3moLinkedAddress({ address: account.address }))
            nav.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: Routes.B3MO_CHAT }],
                }),
            )
        },
        [dispatch, nav],
    )

    return (
        <Layout
            title={LL.B3MO_AGENT_PICK_WALLET_TITLE()}
            fixedHeader={
                <BaseView pt={8}>
                    <BaseText typographyFont="bodyMedium">{LL.B3MO_AGENT_PICK_WALLET_SUBTITLE()}</BaseText>
                </BaseView>
            }
            body={
                <BaseView pt={16}>
                    <FlatList
                        data={eligible}
                        keyExtractor={item => item.address}
                        ItemSeparatorComponent={() => <BaseSpacer height={8} />}
                        renderItem={({ item }) => (
                            <BaseTouchable action={() => onSelect(item)} testID="b3mo-pick-wallet">
                                <BaseView p={16} style={styles.card}>
                                    <BaseText typographyFont="bodyBold">{item.alias}</BaseText>
                                    <BaseSpacer height={4} />
                                    <BaseText typographyFont="captionMedium">
                                        {AddressUtils.humanAddress(item.address, 6, 6)}
                                    </BaseText>
                                </BaseView>
                            </BaseTouchable>
                        )}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
})
