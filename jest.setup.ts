import "@testing-library/jest-native/extend-expect"
import { ReactNode } from "react"
import "whatwg-fetch"

const componentMock = ({ children }: { children: ReactNode }) => children
jest.mock("react-native-localize", () => ({
    getLocales: () => [
        {
            countryCode: "GB",
            languageTag: "en-GB",
            languageCode: "en",
            isRTL: false,
        },
        {
            countryCode: "US",
            languageTag: "en-US",
            languageCode: "en",
            isRTL: false,
        },
        {
            countryCode: "FR",
            languageTag: "fr-FR",
            languageCode: "fr",
            isRTL: false,
        },
    ],

    getNumberFormatSettings: () => ({
        decimalSeparator: ".",
        groupingSeparator: ",",
    }),

    getCalendar: () => "gregorian", // or "japanese", "buddhist"
    getCountry: () => "US", // the country code you want
    getCurrencies: () => ["USD", "EUR"], // can be empty array
    getTemperatureUnit: () => "celsius", // or "fahrenheit"
    getTimeZone: () => "Europe/Paris", // the timezone you want
    uses24HourClock: () => true,
    usesMetricSystem: () => true,

    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
}))
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
jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageCode: "en" }],
}))
jest.mock("expo-clipboard", () => {})
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
jest.mock("expo-camera", () => {})
jest.mock("expo-barcode-scanner", () => {})
jest.mock("@react-navigation/bottom-tabs", () => ({
    ...jest.requireActual("@react-navigation/bottom-tabs"),
    useBottomTabBarHeight: jest.fn(() => 10),
}))
;(global as any).ReanimatedDataMock = {
    now: () => 0,
}
