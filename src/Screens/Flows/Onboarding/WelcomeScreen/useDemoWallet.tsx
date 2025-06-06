import React, { useCallback, useMemo } from "react"
import { BaseButton, useApplicationSecurity, WalletEncryptionKeyHelper } from "~Components"
import { DerivationPath, ERROR_EVENTS } from "~Constants"
import { useCreateWallet } from "~Hooks"
import { IMPORT_TYPE, SecurityLevelType } from "~Model"
import { selectAreDevFeaturesEnabled, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { debug } from "~Utils"

const IS_CI_BUILD = process.env.IS_CI_BUILD_ENABLED === "true"

export const useDemoWallet = () => {
    const dispatch = useAppDispatch()
    const { createLocalWallet: createWallet } = useCreateWallet()
    const { migrateOnboarding } = useApplicationSecurity()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const getDemoMnemonic = useCallback(() => {
        const demoMnemonic = "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" ")
        const ciMnemonic = process.env.E2E_MNEMONIC

        if (IS_CI_BUILD && ciMnemonic) {
            return ciMnemonic.split(" ")
        }

        return demoMnemonic
    }, [])

    const onDemoOnboarding = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        const mnemonic = getDemoMnemonic()
        const userPassword = "111111"
        await WalletEncryptionKeyHelper.init(userPassword)
        await createWallet({
            userPassword,
            onError: e => debug(ERROR_EVENTS.APP, e),
            mnemonic,
            derivationPath: DerivationPath.VET,
            importType: IMPORT_TYPE.MNEMONIC,
        })
        await migrateOnboarding(SecurityLevelType.SECRET, userPassword)
        dispatch(setIsAppLoading(false))
    }, [createWallet, dispatch, getDemoMnemonic, migrateOnboarding])

    const DEV_DEMO_BUTTON = useMemo(() => {
        if (devFeaturesEnabled || IS_CI_BUILD) {
            return <BaseButton size="md" variant="link" action={onDemoOnboarding} title="DEV:DEMO" testID="dev_demo" />
        } else {
            return null
        }
    }, [devFeaturesEnabled, onDemoOnboarding])

    return DEV_DEMO_BUTTON
}
