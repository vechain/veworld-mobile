import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated"
import { DeviceUtils, PlatformUtils } from "~Utils"

type DeviceContextProps = {
    isLowEndDevice: boolean
}
const DeviceContext = createContext<DeviceContextProps>({ isLowEndDevice: false })

export const DeviceProvider = ({ children }: PropsWithChildren) => {
    const [isLowEndDevice, setIsLowEndDevice] = useState(false)

    useEffect(() => {
        const checkDevicePerformance = async () => {
            const isSlowDevice = PlatformUtils.isAndroid() && (await DeviceUtils.isSlowDevice())
            setIsLowEndDevice(isSlowDevice)
        }

        checkDevicePerformance()
    }, [])

    const memoized = useMemo(() => ({ isLowEndDevice }), [isLowEndDevice])

    return (
        <DeviceContext.Provider value={memoized}>
            <ReducedMotionConfig mode={isLowEndDevice ? ReduceMotion.Always : ReduceMotion.System} />
            {children}
        </DeviceContext.Provider>
    )
}

export const useDevice = () => useContext(DeviceContext)
