import React, { useCallback, useEffect } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"
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
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="flex-start" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font={Fonts.large_title}>
                        Biometrics Placeholder
                    </BaseText>

                    <BaseText font={Fonts.body} my={10}>
                        Biometrics Placeholder
                    </BaseText>
                </BaseView>
                <BaseSpacer height={60} />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
