import React from 'react'
import {BaseButton, BaseSafeArea, BaseSpacer, BaseText} from '~Components'
import {useNavigation} from '@react-navigation/native'

export const OnboardingScreen = () => {
    const nav = useNavigation()

    const onNavigate = () => {
        nav.goBack()
    }

    return (
        <>
            <BaseSafeArea transparent />
            <BaseText>OnboardingScreen</BaseText>

            <BaseSpacer height={20} />

            <BaseButton action={onNavigate} mx={20}>
                <BaseText isButton>Navigate</BaseText>
            </BaseButton>
        </>
    )
}
