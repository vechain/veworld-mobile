import { Device, useListListener, useRealm } from "~Storage"

export const useDevicesList = () => {
    const { store } = useRealm()

    const devices = useListListener(Device.getName(), store) as Device[]

    return devices
}
