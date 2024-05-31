import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

// Feature flags

// TODO - Temporary flag to disable the buy feature for iOS
export const COINBASE_FEATURE_ENABLED = isAndroid()
