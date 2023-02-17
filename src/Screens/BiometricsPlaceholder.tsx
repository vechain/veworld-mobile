import React, { FC, useCallback, useEffect } from "react"
import { AlertUtils, BiometricsUtils } from "~Common"
import { BaseView } from "~Components"

type Props = {
    setisAppLock: (isAppLock: boolean) => void
    backgroundToActive: boolean
}

export const BiometricsPlaceholder: FC<Props> = ({
    setisAppLock,
    backgroundToActive,
}) => {
    const validateBiometrics = useCallback(async () => {
        const recursiveFaceId = async () => {
            let results = await BiometricsUtils.authenticateWithBiometric()
            if (results.success) {
                setisAppLock(false)
                return
            } else if (results.error) {
                AlertUtils.showCancelledFaceIdAlert(
                    async () => {
                        // TODO: SIGN OUT USER
                        console.log("cancel action - SIGN OUT USER")
                        return
                    },
                    async () => {
                        await recursiveFaceId()
                    },
                )
            }
        }

        recursiveFaceId()
    }, [setisAppLock])

    useEffect(() => {
        backgroundToActive && validateBiometrics()
    }, [backgroundToActive, validateBiometrics])

    return <BaseView grow={1} background="#28008C" />
}
