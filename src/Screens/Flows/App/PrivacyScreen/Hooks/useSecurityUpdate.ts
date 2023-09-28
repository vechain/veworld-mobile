import { showErrorToast, useApplicationSecurity } from "~Components"
import { useCallback } from "react"
import { useI18nContext } from "~i18n"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"

export const useSecurityUpdate = () => {
    const { updateSecurityMethod, lockApplication } = useApplicationSecurity()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    return useCallback(
        async (pinCode: string, newPinCode?: string) => {
            try {
                const updateSuccess = await updateSecurityMethod(
                    pinCode,
                    newPinCode,
                )

                if (!updateSuccess) {
                    showErrorToast({
                        text1: LL.ERROR_SECURITY_UPDATE_REVERTED(),
                    })
                }
            } catch (e) {
                showErrorToast({ text1: LL.ERROR_SECURITY_UPDATE_FAILED() })

                dispatch(setIsAppLoading(true))

                setTimeout(() => {
                    dispatch(setIsAppLoading(false))
                    lockApplication()
                }, 5000)
            }
        },
        [dispatch, LL, lockApplication, updateSecurityMethod],
    )
}
