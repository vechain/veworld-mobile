/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable i18next/no-literal-string */
import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    SelectDerivationPathBottomSheet,
} from "~Components"
import { Address, HDKey, keystore, KeystoreAccount, Mnemonic } from "@vechain/sdk-core"
import { ScrollView } from "react-native"
import { AddressUtils } from "~Utils"
import { COLORS, DerivationPath } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { selectDerivedPath, useAppSelector } from "~Storage/Redux"

type Child = {
    xpriv: string
    xpub: string
    address: string
    index: number
    path: DerivationPath
}

export const TestSdkScreen = () => {
    const theme = useTheme()
    const {
        ref: derivationPathRef,
        onOpen: onOpenDerivationPath,
        onClose: onCloseDerivationPath,
    } = useBottomSheetModal()
    const path = useAppSelector(selectDerivedPath)

    const [mnemonic, setMnemonic] = useState<string[] | undefined>()
    const [vetChildren, setVetChild] = useState<Child[] | []>([])
    const [ethChildren, setEthChild] = useState<Child[] | []>([])
    const [children, setChild] = useState<Child[] | []>([])
    const [keystoreAccount, setKeystoreAccount] = useState<KeystoreAccount>()

    const createWallet = useCallback(async () => {
        const randomMnemonic = Mnemonic.of()
        setMnemonic(randomMnemonic)
    }, [])

    const deriveAccounts = useCallback(async () => {
        if (!mnemonic) return

        const hdnode = HDKey.fromMnemonic(mnemonic, path)

        const childIndex = path === DerivationPath.VET ? vetChildren.length : ethChildren.length

        const child = hdnode.deriveChild(childIndex + 1)
        if (!child.publicKey || !child.privateKey) return

        const address = Address.ofPublicKey(child.publicKey).toString()

        if (path === DerivationPath.VET) {
            setVetChild(prev => [
                ...prev,
                { xpriv: child.privateExtendedKey, xpub: child.publicExtendedKey, address, index: child.index, path },
            ])

            setChild(prev => [
                ...prev,
                { xpriv: child.privateExtendedKey, xpub: child.publicExtendedKey, address, index: child.index, path },
            ])
        }

        if (path === DerivationPath.ETH) {
            setEthChild(prev => [
                ...prev,
                { xpriv: child.privateExtendedKey, xpub: child.publicExtendedKey, address, index: child.index, path },
            ])

            setChild(prev => [
                ...prev,
                { xpriv: child.privateExtendedKey, xpub: child.publicExtendedKey, address, index: child.index, path },
            ])
        }
    }, [ethChildren, mnemonic, path, vetChildren])

    const importWithPrivateKey = useCallback(async () => {
        var startTime = performance.now()
        const _keystoreAccount = await keystore.decrypt(ks, "safe")
        setKeystoreAccount(_keystoreAccount)
        var endTime = performance.now()
        console.log(`Call to keystore.decrypt took ${endTime - startTime} milliseconds.`)
    }, [])

    return (
        <BaseView flex={1} justifyContent="flex-start" alignItems="center" px={24}>
            <ScrollView style={{ width: "100%" }}>
                <BaseSpacer height={80} />

                <BaseButton action={createWallet} title="Create Wallet" />
                <BaseSpacer height={12} />
                <BaseText>{mnemonic?.toString()}</BaseText>
                <BaseSpacer height={24} />

                {mnemonic && (
                    <>
                        <BaseTouchableBox
                            bg="transparent"
                            haptics="Medium"
                            action={onOpenDerivationPath}
                            px={4}
                            justifyContent="space-between">
                            <BaseView flex={1}>
                                <BaseText align="left" typographyFont="bodyBold">
                                    {"Derivation Path"}
                                </BaseText>
                            </BaseView>
                            <BaseIcon name="chevron-right" size={24} color={theme.colors.text} />
                        </BaseTouchableBox>

                        <BaseButton action={deriveAccounts} title="Derive Account" />

                        <BaseSpacer height={12} />
                        {children.length > 0 &&
                            children.map(child => (
                                <BaseView key={child.address}>
                                    <BaseView bg={COLORS.WHITE} p={8}>
                                        <BaseText>address: {AddressUtils.humanAddress(child.address, 4, 4)}</BaseText>
                                        <BaseText>xpriv: {AddressUtils.humanAddress(child.xpriv, 4, 4)}</BaseText>
                                        <BaseText>xpub: {AddressUtils.humanAddress(child.xpub, 4, 4)}</BaseText>
                                        <BaseText>index: {child.index}</BaseText>
                                        <BaseText>path: {child.path}</BaseText>
                                    </BaseView>
                                    <BaseSpacer height={12} />
                                </BaseView>
                            ))}
                        <BaseSpacer height={24} />
                    </>
                )}

                <BaseButton action={importWithPrivateKey} title="Import with keystore" />
                {keystoreAccount?.address && (
                    <>
                        <BaseSpacer height={12} />
                        <BaseText>address: {AddressUtils.humanAddress(keystoreAccount?.address, 4, 4)}</BaseText>
                        <BaseText>pk: {AddressUtils.humanAddress(keystoreAccount?.privateKey, 4, 4)}</BaseText>
                        <BaseSpacer height={24} />
                    </>
                )}
            </ScrollView>

            <SelectDerivationPathBottomSheet ref={derivationPathRef} onClose={onCloseDerivationPath} />
        </BaseView>
    )
}

const ks = JSON.parse(
    '{"address":"25a083036348b5b229095d354059e67e901ec3e8","id":"ab84ab5d-2135-4944-a19f-deb74bcfb4e6","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"d51fdab2acad9ba63bce57d90559c48d"},"ciphertext":"bd2654cbb0228133d1a2fed357ba7013ea1217e0ab471ad26ceb31923a3fc0eb","kdf":"scrypt","kdfparams":{"salt":"b6d327629a09d76ea9a02635334e75579441d78017edadcbe06c72a0387625ba","n":131072,"dklen":32,"p":1,"r":8},"mac":"ffee82f93cbc8a31b73f39f163e9997298a0fbfc14dcc64cb7d07575dc6ebc18"},"x-ethers":{"client":"ethers/6.13.2","gethFilename":"UTC--2024-09-23T13-34-48.0Z--25a083036348b5b229095d354059e67e901ec3e8","path":"m/44\'/60\'/0\'/0/0","locale":"en","mnemonicCounter":"14682fbbda9c9880b137af3d3fccb8fd","mnemonicCiphertext":"ce6d9947d9071816a9b33d15619fd054","version":"0.1"}}',
)
