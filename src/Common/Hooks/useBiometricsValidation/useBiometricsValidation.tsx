import { useCallback, useEffect, useState } from "react"
import { BiometricsUtils } from "~Common/Utils"

export const useBiometricsValidation = () => {
    const [isSuccess, setIsSuccess] = useState(false)

    const authenticateBiometrics = useCallback(async () => {
        let result = await BiometricsUtils.authenticateWithBiometric()
        if (result.success) setIsSuccess(true)
    }, [])

    useEffect(() => {
        authenticateBiometrics()
    }, [authenticateBiometrics])

    return { isSuccess }
}
