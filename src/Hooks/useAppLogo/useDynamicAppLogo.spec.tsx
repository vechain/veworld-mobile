import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useDynamicAppLogo } from "./useDynamicAppLogo"

import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"

jest.mock("~Hooks/useFetchFeaturedDApps", () => ({
    ...jest.requireActual("~Hooks/useFetchFeaturedDApps"),
    useVeBetterDaoDapps: jest.fn(),
}))

describe("useDynamicAppLogo", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return the correct logo for a VBD app", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({})
        const { result } = renderHook(() => useDynamicAppLogo({}), {
            wrapper: TestWrapper,
        })

        expect(
            result.current({
                app: {
                    name: "TEST APP",
                    description: "TEST DESC",
                    external_url: "https://vechain.org",
                    logo: "https://logo.vechain.org",
                    banner: "https://banner.vechain.org",
                    screenshots: [],
                    social_urls: [],
                    app_urls: [],
                },
            }),
        ).toBe("https://logo.vechain.org")
    })
    it("should return the correct logo for a Discovery dApp but with a VBD id", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({
            data: [
                {
                    name: "TEST APP",
                    description: "TEST DESC",
                    external_url: "https://vechain.org",
                    logo: "https://logo.vechain.org",
                    banner: "https://banner.vechain.org",
                    screenshots: [],
                    social_urls: [],
                    app_urls: [],
                    id: "0x0",
                },
            ],
        })
        const { result } = renderHook(() => useDynamicAppLogo({}), {
            wrapper: TestWrapper,
        })

        expect(
            result.current({
                app: {
                    veBetterDaoId: "0x0",
                    amountOfNavigations: 0,
                    createAt: Date.now(),
                    href: "https://vebetterdao.org",
                    isCustom: false,
                    name: "TEST",
                },
            }),
        ).toBe("https://logo.vechain.org")
    })
    it("should return the correct logo for a Discovery dApp with an iconUri", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({})
        const { result } = renderHook(() => useDynamicAppLogo({}), {
            wrapper: TestWrapper,
        })

        expect(
            result.current({
                app: {
                    amountOfNavigations: 0,
                    createAt: Date.now(),
                    href: "https://vebetterdao.org",
                    isCustom: false,
                    name: "TEST",
                    iconUri: "https://logo.vechain.org",
                },
            }),
        ).toBe("https://logo.vechain.org")
    })
    it("should return the correct logo for a Discovery dApp with an id", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({})
        const { result } = renderHook(() => useDynamicAppLogo({}), {
            wrapper: TestWrapper,
        })

        expect(
            result.current({
                app: {
                    amountOfNavigations: 0,
                    createAt: Date.now(),
                    href: "https://vebetterdao.org",
                    isCustom: false,
                    name: "TEST",
                    id: "com.test",
                },
            }),
        ).toBe("https://vechain.github.io/app-hub/imgs/com.test.png")
    })
    it("should fallback to favicon if nothing matches", () => {
        ;(useVeBetterDaoDapps as jest.Mock).mockReturnValue({})
        const { result } = renderHook(() => useDynamicAppLogo({}), {
            wrapper: TestWrapper,
        })

        expect(
            result.current({
                app: {
                    amountOfNavigations: 0,
                    createAt: Date.now(),
                    href: "https://vebetterdao.org",
                    isCustom: false,
                    name: "TEST",
                },
            }),
        ).toBe(
            // eslint-disable-next-line max-len
            "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE%2CSIZE%2CURL&size=64&url=https%3A%2F%2Fvebetterdao.org",
        )
    })
})
