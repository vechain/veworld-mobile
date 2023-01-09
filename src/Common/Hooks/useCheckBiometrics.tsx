import {AuthenticationType, SecurityLevel} from 'expo-local-authentication'
import {useCallback, useEffect, useState} from 'react'
import {Biometrics} from '~Common/Utils'

/*
    Curernt biometrics availabilty check logic

        if it has haedware AND
            it has already enrolled
                Ask to auth

        else if
            Not enrolled yet OR
            Doesn't have hardware
            Erolledlevel == NONE
                use user generated password
*/

export const useCheckBiometrics = () => {
    const [IsLoading, setIsLoading] = useState(false)
    const [IsBiometrics, setIsBiometrics] = useState<boolean | undefined>()
    const [BiometricType, setBiometricType] = useState<string | undefined>()
    const [SuppoertedBiometrics, setSuppoertedBiometrics] = useState<
        string | undefined
    >()

    const init = useCallback(async () => {
        setIsLoading(true)
        let level = await Biometrics.getDeviceEnrolledLevel()
        let isHardware = await Biometrics.getGeviceHasHardware()
        let isEnrolled = await Biometrics.getIsDeviceEnrolled()
        let type = await Biometrics.getBiometricTypeAvailable()

        if (isHardware && isEnrolled && level !== SecurityLevel.NONE) {
            let leveleType = SecurityLevel[level]
            // @ts-ignore
            let bioType = AuthenticationType[type]
            setBiometricType(leveleType)
            setIsBiometrics(true)
            setSuppoertedBiometrics(bioType)
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        init()
    }, [init])

    return {IsBiometrics, BiometricType, SuppoertedBiometrics, IsLoading}
}
