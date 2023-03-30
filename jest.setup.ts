import "@testing-library/jest-native/extend-expect"
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

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}))
jest.mock("expo-local-authentication")
jest.mock("expo-haptics", () => ({
    ImpactFeedbackStyle: {
        Light: "light",
        Medium: "medium",
        Heavy: "heavy",
    },
    impactAsync: jest.fn(),
}))
jest.mock("expo-localization", () => {})
jest.mock("expo-clipboard", () => {})
jest.mock("react-native-wagmi-charts", () => {})
jest.mock("react-native-draggable-flatlist", () => {})
jest.mock("react-native-gesture-handler", () => {})
jest.mock("expo-camera", () => {})
jest.mock("expo-barcode-scanner", () => {})
jest.mock("@react-navigation/bottom-tabs", () => ({
    ...jest.requireActual("@react-navigation/bottom-tabs"),
    useBottomTabBarHeight: jest.fn(() => 10),
}))
;(global as any).ReanimatedDataMock = {
    now: () => 0,
}
