import { useCallback } from "react"
import { Device } from "~Model"
import { renameDevice, useAppDispatch } from "~Storage/Redux"

export const useRenameWallet = (device?: Device) => {
    const dispatch = useAppDispatch()

    const changeDeviceAlias = useCallback(
        ({ newAlias }: { newAlias: string }) => {
            if (!device) {
                throw new Error("Device not found when renaming it")
            }
            dispatch(
                renameDevice({
                    rootAddress: device.rootAddress,
                    alias: newAlias,
                }),
            )
        },
        [device, dispatch],
    )

    return { changeDeviceAlias }
}
