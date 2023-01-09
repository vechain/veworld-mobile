import React from 'react'
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    // BaseSwitch,
    BaseText,
    BaseView,
} from '~Components'
// import {Biometrics, useCheckBiometrics, useRenderCounter} from '~Common'

export const SecurityScreen = () => {
    // const {IsBiometrics, BiometricType, SuppoertedBiometrics, IsLoading} =
    //     useCheckBiometrics()

    // const [IsOn, setIsOn] = useState(false)

    const onButtonPress = async () => {
        // let isAuth = await Biometrics.authenticateWithbiometric()
    }

    // const onToggleAction = useCallback(() => {
    //     console.log('CALLED')
    //     setIsOn(prev => prev!)
    // }, [])

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

                {/* {IsBiometrics && (
                    <BaseSwitch toggleAction={onToggleAction} isOn={IsOn} />
                )} */}

                <BaseView align="center" w={100}>
                    <BaseButton
                        filled
                        action={onButtonPress}
                        w={100}
                        mx={20}
                        title={'GO!'}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
