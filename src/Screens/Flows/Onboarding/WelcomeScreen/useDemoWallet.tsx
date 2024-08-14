import React, { useCallback, useMemo } from "react"
import { BaseButton, useApplicationSecurity, WalletEncryptionKeyHelper } from "~Components"
import { ERROR_EVENTS } from "~Constants"
import { useCreateWallet } from "~Hooks"
import { SecurityLevelType } from "~Model"
import { selectAreDevFeaturesEnabled, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { debug } from "~Utils"

const IS_CI_BUILD = process.env.IS_CI_BUILD_ENABLED === "true"

export const useDemoWallet = () => {
    const dispatch = useAppDispatch()
    const { createLocalWallet: createWallet } = useCreateWallet()
    const { migrateOnboarding } = useApplicationSecurity()
    const devFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const onDemoOnboarding = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        const mnemonic = "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(" ")
        const userPassword = "111111"
        await WalletEncryptionKeyHelper.init(userPassword)
        await createWallet({
            userPassword,
            onError: e => debug(ERROR_EVENTS.APP, e),
            mnemonic,
            isImported: false,
        })
        await migrateOnboarding(SecurityLevelType.SECRET, userPassword)
        dispatch(setIsAppLoading(false))
    }, [createWallet, dispatch, migrateOnboarding])

    const DEV_DEMO_BUTTON = useMemo(() => {
        if (devFeaturesEnabled || IS_CI_BUILD) {
            return <BaseButton size="md" variant="link" action={onDemoOnboarding} title="DEV:DEMO" testID="dev_demo" />
        } else {
            return null
        }
    }, [devFeaturesEnabled, onDemoOnboarding])

    return DEV_DEMO_BUTTON
}
