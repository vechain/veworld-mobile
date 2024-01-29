import { PlatformUtils } from "~Utils"

// Feature flags

// TODO - Temporary flag to disable the buy feature for iOS
export const BUY_FEATURE_ENABLED = PlatformUtils.isAndroid()
