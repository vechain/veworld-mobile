import React, { useCallback, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseButton,
    BaseBottomSheet,
    BaseBottomSheetTextInput,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { InteractionManager } from "react-native"

type Props = {
    onHide: () => void
    onUnlock: (pwd: string) => Promise<void>
}

const snapPoints = ["60%"]

export const UnlockKeystoretBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onHide, onUnlock }, ref) => {
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
            onChange={handleSheetChanges}>
            <BaseText typographyFont="subTitleBold">
                {LL.TITLE_UNLOCK_KEYSTORE()}
            </BaseText>
            <BaseSpacer height={38} />

            <BaseView>
                <BaseView>
                    <BaseBottomSheetTextInput
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                        secureTextEntry={true}
                        testID="unlock-keystore-password-input"
                    />
                </BaseView>

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
})
