import React, {useEffect, useState} from 'react'
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
    MnemonicCard,
} from '~Components'
import {Alert} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import {useI18nContext} from '~i18n'
import {sanifySeed} from '~Common'

export const SeedPhraseScreen = () => {
    const {LL} = useI18nContext()

    const [Mnemonic, setMnemonic] = useState('')
    const [MnemonicArray, _setMnemonicArray] = useState<string[]>(
        Array.from({length: 12}),
    )

    const [IsChecked, setIsChecked] = useState(false)

    const onCopyToClipboard = async () => {
        await Clipboard.setStringAsync(Mnemonic)
        Alert.alert('Copied to clipboard')
    }

    // todo.vas -> remove once wallet service is up
    useEffect(() => {
        let text =
            'cactus quit copper cluster refuse palace faith kid atom reward draft decade'

        let seed = sanifySeed(text)

        if (seed.length === 12) {
            setMnemonic(text)
            _setMnemonicArray(seed)
        }
    }, [])

    const onBackupPress = () => {}

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font="large_title" align="left">
                        {LL.TITLE_MNEMONIC()}
                    </BaseText>

                    <BaseText font="body" my={10}>
                        {LL.BD_MNEMONIC_SUBTITLE()}
                    </BaseText>

                    <BaseSpacer height={60} />

                    <BaseButton
                        selfAlign="flex-end"
                        action={onCopyToClipboard}
                        w={100}
                        title={LL.BTN_MNEMONIC_CLIPBOARD()}
                        disabled={false}
                    />

                    <MnemonicCard mnemonicArray={MnemonicArray} />

                    <BaseText font="footnote_accent" color="red" my={10}>
                        {LL.BD_MNEMONIC_DISCLAIMER()}
                    </BaseText>

                    <BaseText font="footnote">
                        {LL.BD_MNEMONIC_BACKUP()}
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <CheckBoxWithText
                        text={LL.BTN_MNEMONIC_CHECKBOX()}
                        checkAction={setIsChecked}
                    />

                    <BaseButton
                        filled
                        action={onBackupPress}
                        w={100}
                        px={20}
                        title={LL.BTN_MNEMONIC_BACKUP()}
                        disabled={!IsChecked}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
