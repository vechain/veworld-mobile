import React, { useCallback, useEffect } from "react"
import { BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { useBiometricsValidation } from "~Common/Hooks/useBiometricsValidation"

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

    return (
        <BaseSafeArea grow={1} style={{ backgroundColor: "#28008C" }}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="flex-start" grow={1} mx={20}>
                <BaseSpacer height={60} />
            </BaseView>
            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
