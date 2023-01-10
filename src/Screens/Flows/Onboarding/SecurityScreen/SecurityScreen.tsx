import React, {useState} from 'react'
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseSwitch,
    BaseText,
    BaseView,
} from '~Components'
import {Biometrics, useCheckBiometrics} from '~Common'
import {SecurityLevel} from '~Common/Enums'

export const SecurityScreen = () => {
    const {DeviceSecurity, getBiometricsType} = useCheckBiometrics()
    const [IsBtnDisabled, setIsBtnDisabled] = useState(true)

    const onButtonPress = async () => {
        let {success} = await Biometrics.authenticateWithbiometric()
        if (success) {
            // create keychain now probably
            onNavigate()
        } else {
            // handle failure message
        }
    }

    const onToggleAction = (isOn: boolean) => {
        setIsBtnDisabled(!isOn)
    }

    const onNavigate = () => {}

    if (DeviceSecurity === SecurityLevel.NONE) {
        return (
            <BaseSafeArea grow={1}>
                <BaseView align="center" justify="center" grow={1} mx={20}>
                    <BaseText font="body">
                        Please enable biometrics or device pin to continue
                    </BaseText>
                </BaseView>
            </BaseSafeArea>
        )
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font="large_title">Secure Wallet</BaseText>

                    <BaseText font="body" my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </BaseText>
                </BaseView>

                <BaseView orientation="row" justify="space-between" w={100}>
                    <BaseText>Secure with {getBiometricsType}</BaseText>
                    <BaseSwitch toggleAction={onToggleAction} />
                </BaseView>

                <BaseView align="center" w={100}>
                    <BaseButton
                        filled
                        action={onButtonPress}
                        w={100}
                        mx={20}
                        title={'GO!'}
                        disabled={IsBtnDisabled}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
