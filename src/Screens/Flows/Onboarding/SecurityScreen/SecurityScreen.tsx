import React, {useMemo} from 'react'
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from '~Components'
import {Biometrics, useCheckBiometrics} from '~Common'
import {SecurityLevel} from '~Common/Enums'
import {useI18nContext} from '~i18n'

export const SecurityScreen = () => {
    const {LL} = useI18nContext()

    const {DeviceSecurity, getBiometricsType} = useCheckBiometrics()

    const IsBiometricsButtonDisabled = useMemo(
        () => (DeviceSecurity === SecurityLevel.BIOMETRIC ? false : true),
        [DeviceSecurity],
    )

    const onBiometricsPress = async () => {
        let {success} = await Biometrics.authenticateWithbiometric()
        if (success) {
        } else {
            // handle failure message
        }
    }

    const onPasswordPress = () => {}

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
                    <BaseText font="large_title">
                        {LL.TITLE_SECURITY()}
                    </BaseText>

                    <BaseText font="body" my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <BaseButton
                        filled
                        action={onBiometricsPress}
                        w={100}
                        mx={20}
                        my={20}
                        title={LL.BTN_SECURTY_01({type: getBiometricsType})}
                        disabled={IsBiometricsButtonDisabled}
                    />

                    <BaseButton
                        bordered
                        action={onPasswordPress}
                        w={100}
                        mx={20}
                        title={LL.BTN_SECURITY_02()}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
