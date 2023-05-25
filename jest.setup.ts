import "@testing-library/jest-native/extend-expect"
import { ReactNode } from "react"
import "whatwg-fetch"

const componentMock = ({ children }: { children: ReactNode }) => children
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

jest.mock("react-native-bootsplash", () => {})

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
jest.mock("expo-localization", () => ({
    getLocales: jest.fn(() => [{ languageCode: "en", languageTag: "en-US" }]),
}))
jest.mock("expo-clipboard", () => {})
jest.mock("react-native-linear-gradient", () => {})
jest.mock("react-native-draggable-flatlist", () => ({
    NestableScrollContainer: componentMock,
    NestableDraggableFlatList: componentMock,
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
    Camera: {
        getCameraPermissionsAsync: jest.fn(),
        requestCameraPermissionsAsync: jest.fn(),
    },
}))
jest.mock("expo-barcode-scanner", () => {})
jest.mock("@react-navigation/bottom-tabs", () => ({
    ...jest.requireActual("@react-navigation/bottom-tabs"),
    useBottomTabBarHeight: jest.fn(() => 10),
}))
;(global as any).ReanimatedDataMock = {
    now: () => 0,
}

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
    BottomSheetFlatList: ({ data, renderItem }: any) => {
        return data.map((row: any) => renderItem({ item: row }))
    },
}))

jest.mock("react-native-skeleton-content-nonexpo", () => {})
