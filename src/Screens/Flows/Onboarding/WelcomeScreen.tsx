import React from 'react'
import {BaseButton, BaseSafeArea, BaseSpacer, BaseText} from '~Components'
import {useNavigation} from '@react-navigation/native'
import VectorImage from 'react-native-vector-image'
import {VeChainVetLogo} from '~Assets'
import useThor from "../../../Hooks/Thor/UseThor";

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const thor = useThor()

    const onNavigate = () => {
        nav.navigate('Onboarding')
    }

    return (
        <>
            <BaseSafeArea transparent />
            <BaseText font="large_title_accent">Welcome to VeWorld</BaseText>

            <VectorImage source={VeChainVetLogo} />

            <BaseSpacer height={20} />

            <BaseButton action={onNavigate} mx={20}>
                <BaseText isButton>Navigate</BaseText>
            </BaseButton>

            <BaseSpacer height={20} />

            <BaseText>Current Block: {thor.status.head.number}</BaseText>
        </>
    )
}
