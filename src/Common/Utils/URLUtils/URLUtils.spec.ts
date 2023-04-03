import URLUtils from "./URLUtils"

describe("Compare URLs", function () {
    test("should return true for same URLs", function () {
        expect(
            URLUtils.compareURLs(
                "https://www.google.com",
                "https://www.google.com",
            ),
        ).toBe(true)
    })

    test("should return false for different URLs", function () {
        expect(
            URLUtils.compareURLs(
                "https://www.google.com",
                "https://www.facebook.com",
            ),
        ).toBe(false)
    })

    describe("Compare world of V DApps", function () {
        test("should return false for different worldofV DApps", function () {
            expect(
                URLUtils.compareURLs(
                    "https://worldofv.art/playground/lottery/vebounce-blockchain-lottery",
                    "https://shark-gang.worldofv.art/",
                ),
            ).toBe(false)
        })

        test("should return false for different worldofV DApps", function () {
            expect(
                URLUtils.compareURLs(
                    "https://worldofv.art/playground/lottery/vebounce-blockchain-lottery",
                    "https://worldofv.art/#/burn/fusionG2",
                ),
            ).toBe(false)
        })

        test("should return false for different worldofV DApps", function () {
            expect(
                URLUtils.compareURLs(
                    "https://vereapers.worldofv.art/#/",
                    "https://corgi-gang.worldofv.art/#/",
                ),
            ).toBe(false)
        })
    })
})

describe("Clean URLs", function () {
    test("should return clean URL", function () {
        expect(URLUtils.clean("https://www.google.com")).toBe(
            "https://www.google.com",
        )
    })

    test("should return clean URL", function () {
        expect(URLUtils.clean("https://www.google.com/")).toBe(
            "https://www.google.com",
        )
    })

    test("should return clean URL with paths", function () {
        expect(URLUtils.clean("https://www.google.com/search")).toBe(
            "https://www.google.com/search",
        )
    })

    test("should return clean URL with paths", function () {
        expect(URLUtils.clean("https://www.google.com/search/")).toBe(
            "https://www.google.com/search",
        )
    })
})

describe("isHttps", function () {
    test("should return true for https", function () {
        expect(URLUtils.isHttps("https://www.google.com")).toBe(true)
    })

    test("should return false for http", function () {
        expect(URLUtils.isHttps("http://www.google.com")).toBe(false)
    })

    test("should return false chrome://", function () {
        expect(URLUtils.isHttps("chrome://history")).toBe(false)
    })
})

describe("isLocalHost", function () {
    test("should return true for localhost", function () {
        expect(URLUtils.isLocalHost("http://localhost")).toBe(true)
    })

    test("should return true for localhost with port", function () {
        expect(URLUtils.isLocalHost("http://localhost:3000")).toBe(true)
    })

    test("should return false for google.com", function () {
        expect(URLUtils.isLocalHost("https://www.google.com")).toBe(false)
    })

    test("should return false for chrome://", function () {
        expect(URLUtils.isLocalHost("chrome://history")).toBe(false)
    })

    test("should return true for IP http://127.0.0.1", function () {
        expect(URLUtils.isLocalHost("http://127.0.0.1")).toBe(true)
    })

    test("should return true for IP with port", function () {
        expect(URLUtils.isLocalHost("http://127.0.0.1:3000")).toBe(true)
    })
})

describe("isSecure", function () {
    test("should return true for https", function () {
        expect(URLUtils.isAllowed("https://www.google.com")).toBe(true)
    })

    test("should return false for http", function () {
        expect(URLUtils.isAllowed("http://www.google.com")).toBe(false)
    })

    test("should return for localhost", function () {
        expect(URLUtils.isAllowed("http://127.0.0.1:3000")).toBe(true)
        expect(URLUtils.isAllowed("http://127.0.0.1")).toBe(true)
        expect(URLUtils.isAllowed("http://localhost")).toBe(true)
        expect(URLUtils.isAllowed("http://localhost:3000")).toBe(true)
    })
})
