import { useCallback } from "react"
import { Device } from "~Model"
import { renameDevice, useAppDispatch } from "~Storage/Redux"

export const useRenameWallet = (device: Device) => {
    const dispatch = useAppDispatch()

    const changeDeviceAlias = useCallback(
        ({ newAlias }: { newAlias: string }) => {
            dispatch(
                renameDevice({
                    rootAddress: device.rootAddress,
                    alias: newAlias,
                }),
            )
        },
        [dispatch, device.rootAddress],
    )

    return { changeDeviceAlias }
}
