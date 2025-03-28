import "@testing-library/jest-native/extend-expect"
import "whatwg-fetch"

import mockSafeAreaContext from "react-native-safe-area-context/jest/mock"
// @ts-ignore
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock"
import { ReactNode } from "react"
import { SecurityLevelType } from "~Model/Biometrics"
import { WALLET_STATUS } from "~Model/Wallet"
import { MMKV } from "react-native-mmkv"
import localizeMock from "react-native-localize/mock"

const componentMock = ({ children }: { children: ReactNode }) => children

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext)
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper")
jest.mock("react-native-quick-crypto", () => ({
    getRandomValues: jest.fn(buffer => buffer),
    randomFillSync: jest.fn(buffer => buffer),
    createCipheriv: jest.fn(() => ({
        update: (first: string) => first,
        final: () => "",
    })),
    createDecipheriv: jest.fn(() => ({
        update: (first: string) => first,
        final: () => "",
    })),
    createHash: jest.fn(() => ({
        update: () => ({
            digest: (first: string) => first,
        }),
    })),
}))

jest.mock("react-native-onesignal", () => ({
    ...jest.requireActual("react-native-onesignal"),
    OneSignal: {
        ...jest.requireActual("react-native-onesignal").OneSignal,
        initialize: jest.fn(),
        Notifications: {
            getPermissionAsync: jest.fn(),
            requestPermission: jest.fn().mockResolvedValue(true),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        },
        User: {
            getTags: jest.fn().mockResolvedValue({}),
            addTag: jest.fn(),
            removeTag: jest.fn(),
            pushSubscription: {
                optIn: jest.fn(),
                optOut: jest.fn(),
                getOptedInAsync: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            },
        },
        Debug: {
            setLogLevel: jest.fn(),
        },
    },
}))

process.env = Object.assign(process.env, {
    REACT_APP_LOG_LEVEL: "debug",
})

jest.mock("react-native-blob-util", () => ({
    PolyfillBlob: jest.fn(),
    ReactNativeBlobUtil: {
        fetch: jest.fn(() => ({
            json: jest.fn(() => ({
                image: "image",
            })),
        })),
    },
}))

jest.mock("@sentry/react-native", () => ({
    captureException: jest.fn(),
}))

jest.mock("react-native-bootsplash", () => {})

jest.mock("@react-native-camera-roll/camera-roll", () => {})

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}))
jest.mock("expo-haptics", () => ({
    ImpactFeedbackStyle: {
        Light: "light",
        Medium: "medium",
        Heavy: "heavy",
    },
    impactAsync: jest.fn(),
}))
jest.mock("expo-font", () => ({
    ...jest.requireActual("expo-font"),
    loadAsync: jest.fn().mockResolvedValue(true),
}))

jest.mock("react-native-localize", () => localizeMock)

jest.mock("expo-clipboard", () => {})
jest.mock("react-native-linear-gradient", () => "LinearGradient")
jest.mock("react-native-draggable-flatlist", () => ({
    NestableScrollContainer: componentMock,
    NestableDraggableFlatList: componentMock,
    __esModule: true,
    default: componentMock,
}))
jest.mock("react-native-wagmi-charts", () => {
    let LineChart = ({ children }: { children: ReactNode }) => children
    Object.assign(LineChart, {
        Provider: ({ children }: { children: ReactNode }) => children,
        Path: ({ children }: { children: ReactNode }) => children,
        Gradient: ({ children }: { children: ReactNode }) => children,
    })
    return {
        LineChart,
    }
})
jest.mock("expo-camera", () => ({
    Camera: componentMock,
    CameraType: {
        back: "back",
    },
}))
jest.mock("expo-barcode-scanner", () => ({
    BarCodeScanner: {
        Constants: {
            BarCodeType: {
                qr: "qr",
            },
        },
    },
}))

jest.mock("@react-navigation/bottom-tabs", () => ({
    ...jest.requireActual("@react-navigation/bottom-tabs"),
    useBottomTabBarHeight: jest.fn(() => 10),
}))
;(global as typeof globalThis & { ReanimatedDataMock: { now: () => number } }).ReanimatedDataMock = {
    now: () => 0,
}

jest.mock("@gorhom/bottom-sheet", () => ({
    __esModule: true,
    ...require("@gorhom/bottom-sheet/mock"),
    BottomSheetFlatList: ({ data, renderItem }: any) => {
        return data.map((row: any) => renderItem({ item: row }))
    },
}))

jest.mock("react-native-reanimated-skeleton", () => "Skeleton")

jest.mock("@ledgerhq/react-native-hw-transport-ble", () => ({
    __esModule: true,
    default: Object.assign(jest.fn(), { open: jest.fn() }),
}))

jest.mock("react-native-ble-plx", () => ({
    BleError: jest.fn(),
}))

jest.mock("@reown/walletkit", () => ({
    __esModule: true,
    init: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
}))

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter")

jest.mock("mixpanel-react-native", () => ({
    __esModule: true,
    default: () => jest.fn(),
    Mixpanel: jest.fn(() => ({
        init: jest.fn(),
        track: jest.fn(),
    })),
}))

jest.mock("react-native-device-info", () => mockRNDeviceInfo)

jest.mock("~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider", () => ({
    ...jest.requireActual("~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider"),
    useApplicationSecurity: jest.fn().mockReturnValue({
        redux: {
            mmkv: new MMKV({ id: "test-redux" }),
            encryptionKey: "test-redux",
        },
        images: undefined,
        metadata: undefined,
        migrateOnboarding: jest.fn(),
        resetApplication: jest.fn(),
        walletStatus: WALLET_STATUS.UNLOCKED,
        updateSecurityMethod: jest.fn(),
        securityType: SecurityLevelType.BIOMETRIC,
        setWalletStatus: jest.fn(),
        isAppReady: true,
        setIsAppReady: jest.fn(),
        lockApplication: jest.fn(),
    }),
}))
jest.mock("~Components/Providers/PersistedThemeProvider/PersistedThemeProvider", () => ({
    ...jest.requireActual("~Components/Providers/PersistedThemeProvider/PersistedThemeProvider"),
    usePersistedTheme: jest.fn(),
}))

jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
    const turboModuleRegistry = jest.requireActual("react-native/Libraries/TurboModule/TurboModuleRegistry")
    return {
        ...turboModuleRegistry,
        getEnforcing: (name: string) => {
            if (name === "RNCWebView") {
                return null
            }
            return turboModuleRegistry.getEnforcing(name)
        },
    }
})
