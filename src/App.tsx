import React, {useEffect, useState} from 'react'
import {NativeModules, TouchableOpacity} from 'react-native'
import {
    Translation,
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseStatusBar,
    BaseText,
    BaseView,
} from '~Components'
import {TestScreen} from '~Screens/Onboarding/TestScreen'
import { newThor } from "@vechain/connex-framework/dist/thor"
import { DriverNoVendor, SimpleNet } from "@vechain/connex-driver"

const {SampleNativeModule} = NativeModules

const driver = new DriverNoVendor(
    new SimpleNet("https://sync-testnet.vechain.org/"),
    {
        number: 0,
        id: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        size: 170,
        parentID:
            "0xffffffff00000000000000000000000000000000000000000000000000000000",
        timestamp: 1530014400,
        gasLimit: 10000000,
        beneficiary: "0x0000000000000000000000000000000000000000",
        gasUsed: 0,
        totalScore: 0,
        txsRoot:
            "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
        txsFeatures: 0,
        stateRoot:
            "0x4ec3af0acbad1ae467ad569337d2fe8576fe303928d35b8cdd91de47e9ac84bb",
        receiptsRoot:
            "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
        signer: "0x0000000000000000000000000000000000000000",
        isTrunk: true,
        transactions: [],
    }
)

const thor = newThor(driver)
const address = "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"

const App = () => {
    const [nativeText, setNativeText] = useState('')
    const [vthoBalance, setVthoBalance] = useState('')
    const [blockNumber, setBlockNumber] = useState<number>()

    const onPressNativeModule = async () => {
        const res = await SampleNativeModule.getText('Vechain')
        setNativeText(res)
    }

    useEffect(() => {
        queryChain()
    }, [])

    const queryChain = async () => {
        while(true){
            const next = await thor.ticker().next()
            setBlockNumber(next.number)
            const acc = await thor.account(address).get()
            setVthoBalance(acc.energy.toString())
        }
    }

    queryChain()

    return (
        <Translation>
            <BaseSafeArea />
            <BaseStatusBar />

            <BaseScrollView>
                <TouchableOpacity testID="Button" onPress={onPressNativeModule}>
                    <BaseText>Press me to call a native function</BaseText>
                </TouchableOpacity>

                <BaseSpacer height={20} />

                <TestScreen />

                <BaseSpacer height={20} />

                {nativeText && <BaseText>{nativeText}</BaseText>}

                <BaseSpacer height={20} />

                <BaseView>
                    <BaseText >Balance for {address}: </BaseText>
                    <BaseText style={{fontWeight: "bold"}}> {vthoBalance}</BaseText>
                </BaseView>

                <BaseSpacer height={20} />

                <BaseView>
                    <BaseText >Block Number </BaseText>
                    <BaseText style={{fontWeight: "bold"}}> {blockNumber}</BaseText>
                </BaseView>

            </BaseScrollView>
        </Translation>
    )
}

export default App
