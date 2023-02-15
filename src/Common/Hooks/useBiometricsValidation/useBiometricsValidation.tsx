import { useCallback, useEffect, useState } from "react"
import { AlertUtils, BiometricsUtils } from "~Common/Utils"

export const useBiometricsValidation = () => {
    const [isSuccess, setIsSuccess] = useState(false)

    const authenticateBiometrics = useCallback(async () => {
        let result = await BiometricsUtils.authenticateWithBiometric()
        if (result.success) setIsSuccess(true)
        else if (result.error) {
            AlertUtils.showCancelledFaceIdAlert(
                async () => {
                    // TODO Handle user sign out
                    return
                },
                async () => {
                    await authenticateBiometrics()
                },
            )
        }
    }, [])

    useEffect(() => {
        authenticateBiometrics()
    }, [authenticateBiometrics])

    return { isSuccess }
}
