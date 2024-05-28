import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import { useApplicationSecurity } from "~Components"
import { Routes } from "~Navigation"

export const useSecurityUpgrade_V2 = () => {
    const nav = useNavigation()
    const { needsSecurityUpgradeToV2 } = useApplicationSecurity()

    useEffect(() => {
        const needUpgrade = needsSecurityUpgradeToV2()

        if (needUpgrade) {
            setTimeout(() => {
                nav.navigate(Routes.SECURITY_UPGRADE_V2)
            }, 200)
        }
    }, [nav, needsSecurityUpgradeToV2])
}
