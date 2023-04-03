import { useCallback, useState } from "react"
// import { Linking } from "react-native"
import { BiometricsUtils } from "~Common/Utils"
// import { useBiometrics } from "../useBiometrics/useBiometrics"

export const useBiometricsValidation = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    // const biometrics = useBiometrics()

    const authenticateBiometrics = useCallback(async () => {
        let result = await BiometricsUtils.authenticateWithBiometric()
        // user_cancel
        // not_available

        if (result.success) {
            console.log("success")

            setIsAuthenticated(true)
        } else if (result.error === "not_available") {
            console.log("not_available")

            // AlertUtils.showGoToSettingsBiometricsAlert(
            //     async () => {},
            //     async () => {
            //         await Linking.openSettings()
            //     },
            // )
        } else {
            return
        }
    }, [])

    return { authenticateBiometrics, isAuthenticated }
}
