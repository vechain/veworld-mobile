import { useCallback, useEffect, useState } from "react"
import { BiometricsUtils } from "~Common/Utils"
import { SecurityLevelType } from "~Model"

const { getDeviceEnrolledLevel, getGeviceHasHardware, getIsDeviceEnrolled } =
    BiometricsUtils

export const useBiometry = () => {
    const [level, setLevel] = useState("")
    const [accessControll, setAccessControll] = useState(false)

    const init = useCallback(async () => {
        let _level = await getDeviceEnrolledLevel()
        let _isHardware = await getGeviceHasHardware()
        let _isEnrolled = await getIsDeviceEnrolled()

        let _accessControll =
            !_isEnrolled ||
            !_isHardware ||
            _level !== SecurityLevelType.BIOMETRIC
                ? false
                : true

        setLevel(_level)
        setAccessControll(_accessControll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        init()
    }, [init])

    return { level, accessControll }
}
