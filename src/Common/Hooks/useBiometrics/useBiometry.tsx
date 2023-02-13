import { useCallback, useEffect, useState } from "react"
import { BiometricsUtils } from "~Common/Utils"
import { SecurityLevelType } from "~Model"

const { getDeviceEnrolledLevel, getDeviceHasHardware, getIsDeviceEnrolled } =
    BiometricsUtils

export const useBiometry = () => {
    const [level, setLevel] = useState("")
    const [accessControl, setaccessControl] = useState(false)

    const init = useCallback(async () => {
        let _level = await getDeviceEnrolledLevel()
        let _isHardware = await getDeviceHasHardware()
        let _isEnrolled = await getIsDeviceEnrolled()

        let _accessControl =
            !_isEnrolled ||
            !_isHardware ||
            _level !== SecurityLevelType.BIOMETRIC
                ? false
                : true

        setLevel(_level)
        setaccessControl(_accessControl)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        init()
    }, [init])

    return { level, accessControl }
}
