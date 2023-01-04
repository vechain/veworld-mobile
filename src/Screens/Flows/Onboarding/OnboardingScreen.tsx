import React, {useEffect} from 'react'
import {BaseButton, BaseSafeArea, BaseSpacer, BaseText} from '~Components'
import {useNavigation} from '@react-navigation/native'
import useThor from "../../../Hooks/Thor/UseThor";

export const OnboardingScreen = () => {
    const nav = useNavigation()
    const thor = useThor()
    const [vthoBalance, setVthoBalance] = React.useState('')

    const onNavigate = () => {
        nav.goBack()
    }

    useEffect(() => {
        queryChain()
    }, [])

    const queryChain = async () => {
        while(true){
            const acc = await thor.account("0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa").get()
            setVthoBalance(acc.energy.toString())
            await thor.ticker().next()
        }
    }

    return (
        <>
            <BaseSafeArea transparent />
            <BaseText>OnboardingScreen</BaseText>

            <BaseSpacer height={20} />

            <BaseButton action={onNavigate} mx={20}>
                <BaseText isButton>Navigate</BaseText>
            </BaseButton>

            <BaseSpacer height={20} />
            <BaseText >OnboardingScreen</BaseText>

            <BaseSpacer height={20} />
            <BaseText>Current VTHO Balance: {vthoBalance}</BaseText>
        </>
    )
}
