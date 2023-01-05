import React from 'react'
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from '~Components'
import {useNavigation} from '@react-navigation/native'
import VectorImage from 'react-native-vector-image'
import {VeChainVetLogo} from '~Assets'
import {useTheme} from '~Common'
import {useI18nContext} from '~i18n'

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const {LL} = useI18nContext()

    const onNavigate = () => {
        nav.navigate('Onboarding')
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />

            <BaseView align="center" mx={20} grow={1}>
                <BaseView orientation="row">
                    <BaseText font="large_title">{LL.WELCOME_TO()}</BaseText>
                    <BaseText font="large_title" color={theme.colors.button}>
                        VeWorld
                    </BaseText>
                </BaseView>

                <BaseSpacer height={120} />

                <BaseView
                    align="center"
                    justify="space-between"
                    w={100}
                    grow={1}>
                    <BaseView align="center">
                        <VectorImage source={VeChainVetLogo} />
                        <BaseText align="center" py={20}>
                            {LL.BD_WELCOME_SCREEN()}
                        </BaseText>
                    </BaseView>

                    <BaseView align="center" w={100}>
                        <BaseText font="caption" py={10}>
                            {LL.BD_GDPR()}
                        </BaseText>

                        <BaseButton
                            filled
                            action={onNavigate}
                            w={100}
                            children={undefined}
                            title={LL.BTN_GET_STARTED()}
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
            </BaseView>
        </BaseSafeArea>
    )
}
