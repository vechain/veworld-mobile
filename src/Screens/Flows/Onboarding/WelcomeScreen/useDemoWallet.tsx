import React, { useCallback, useMemo } from "react"
import { BaseButton } from "~Components"
import { DerivationPath } from "~Constants"
import { IMPORT_TYPE } from "~Model"
import { selectAreDevFeaturesEnabled, useAppSelector } from "~Storage/Redux"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

const IS_CI_BUILD = process.env.IS_CI_BUILD_ENABLED === "true"

export const useDemoWallet = () => {
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)
    const { onSuccess } = useHandleWalletCreation()

    const getDemoMnemonic = useCallback(() => {
        const demoMnemonic = "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" ")
        const ciMnemonic = process.env.E2E_MNEMONIC

        if (IS_CI_BUILD && ciMnemonic) {
            return ciMnemonic.split(" ")
        }

        return demoMnemonic
    }, [])

    const onDemoOnboarding = useCallback(
        () =>
            onSuccess({
                mnemonic: getDemoMnemonic(),
                pin: "111111",
                derivationPath: DerivationPath.VET,
                importType: IMPORT_TYPE.MNEMONIC,
            }),
        [getDemoMnemonic, onSuccess],
    )

    const DEV_DEMO_BUTTON = useMemo(() => {
        if (devFeaturesEnabled || IS_CI_BUILD) {
            return <BaseButton size="md" variant="link" action={onDemoOnboarding} title="DEV:DEMO" testID="dev_demo" />
        } else {
            return null
        }
    }, [devFeaturesEnabled, onDemoOnboarding])

    return DEV_DEMO_BUTTON
}
