import React from 'react'
import {BaseButton, BaseSafeArea, BaseSpacer, BaseText} from '~Components'
import {useNavigation} from '@react-navigation/native'

export const WelcomeScreen = () => {
    const nav = useNavigation()
    // const {LL} = useI18nContext()
    // {LL.HI({name: 'VeChain'})}

    const onNavigate = () => {
        nav.navigate('Onboarding')
    }

    return (
        <>
            <BaseSafeArea transparent />
            <BaseText>WelcomeScreen</BaseText>

            <BaseSpacer height={20} />

            <BaseButton action={onNavigate} mx={20}>
                <BaseText isButton>Navigate</BaseText>
            </BaseButton>
        </>
    )
}
