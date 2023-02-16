import React, { useCallback, useEffect } from "react"
import { useBiometricsValidation } from "~Common/Hooks/useBiometricsValidation"
import { BackgroundScreen } from "./BackgroundScreen"

type BiometricsPlaceholderProps = {
    onSuccess: () => void
}

export const BiometricsPlaceholder: React.FC<BiometricsPlaceholderProps> = ({
    onSuccess,
}) => {
    const { isSuccess } = useBiometricsValidation()

    const validateBiometrics = useCallback(async () => {
        if (isSuccess) {
            onSuccess()
        }
    }, [isSuccess, onSuccess])

    useEffect(() => {
        validateBiometrics()
    }, [validateBiometrics])

    return <BackgroundScreen />
}
