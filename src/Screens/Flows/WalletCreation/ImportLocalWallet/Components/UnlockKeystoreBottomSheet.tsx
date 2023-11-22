import React, { useCallback, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseButton, BaseBottomSheet, BaseBottomSheetTextInput, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { InteractionManager } from "react-native"

type Props = {
    onHide: () => void
    onUnlock: (pwd: string) => Promise<void>
}

const snapPoints = ["40%"]

export const UnlockKeystoreBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onHide, onUnlock }, ref) => {
        const { LL } = useI18nContext()

        const dispatch = useAppDispatch()
        const [password, setPassword] = useState<string>("")

        const handleUnlock = useCallback(() => {
            dispatch(setIsAppLoading(true))
            setTimeout(() => {
                InteractionManager.runAfterInteractions(() => {
                    onUnlock(password).finally(() => {
                        dispatch(setIsAppLoading(false))
                    })
                })
            }, 1000)
            onHide()
        }, [dispatch, onHide, onUnlock, password])

        const handleSheetChanges = useCallback(() => setPassword(""), [])

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                ignoreMinimumSnapPoint
                ref={ref}
                onChange={handleSheetChanges}
                title={LL.TITLE_UNLOCK_KEYSTORE()}>
                <BaseView flexGrow={1} justifyContent="space-between">
                    <BaseText typographyFont="subSubTitleLight" pt={8}>
                        {LL.SB_INSERT_KEYSTORE_PASSWORD()}
                    </BaseText>
                    <BaseBottomSheetTextInput
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        secureTextEntry={true}
                        placeholder="Insert password..."
                        testID="unlock-keystore-password-input"
                    />

                    <BaseButton
                        haptics="Medium"
                        disabled={password.length < 1}
                        action={handleUnlock}
                        w={100}
                        title={LL.COMMON_BTN_UNLOCK().toUpperCase()}
                    />
                </BaseView>

                <BaseSpacer height={18} />
            </BaseBottomSheet>
        )
    },
)
