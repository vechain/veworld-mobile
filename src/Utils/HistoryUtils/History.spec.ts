import { HistoryDappItem, HistoryUrlItem, HistoryUrlKind, mapHistoryUrls } from "./History"

describe("History", () => {
    describe("mapHistoryUrls", () => {
        it("URL without any associated dapp should return as type URL", () => {
            const mapped = mapHistoryUrls([{ href: "https://hello.world" } as any], [])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("URL with associated dapp should return as type DAPP", () => {
            const mapped = mapHistoryUrls(
                [{ href: "https://hello.world" } as any],
                [{ href: "https://hello.world" } as any],
            )

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.DAPP)
            expect((mapped[0] as HistoryDappItem).dapp).toStrictEqual({ href: "https://hello.world" })
        })
        it("URL not starting on root with associated dapp should return as type DAPP", () => {
            const mapped = mapHistoryUrls(
                [{ href: "https://hello.world/route" } as any],
                [{ href: "https://hello.world" } as any],
            )

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.DAPP)
            expect((mapped[0] as HistoryDappItem).dapp).toStrictEqual({ href: "https://hello.world" })
        })
        it("URL not starting on root without associated dapp should return as type URL starting from origin", () => {
            const mapped = mapHistoryUrls([{ href: "https://hello.world/route" } as any], [])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("Double URLs should count as one", () => {
            const mapped = mapHistoryUrls(
                [{ href: "https://hello.world/route" } as any, { href: "https://hello.world/route2" } as any],
                [],
            )

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("URLs should be in the inverse order", () => {
            const mapped = mapHistoryUrls(
                [{ href: "https://hello.world/route" } as any, { href: "https://world.hello" } as any],
                [],
            )

            expect(mapped).toHaveLength(2)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect(mapped[1].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://world.hello")
            expect((mapped[1] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("Double Dapps should count as one", () => {
            const mapped = mapHistoryUrls(
                [{ href: "https://hello.world/route" } as any, { href: "https://hello.world/route2" } as any],
                [{ href: "https://hello.world" } as any],
            )

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.DAPP)
            expect((mapped[0] as HistoryDappItem).dapp).toStrictEqual({ href: "https://hello.world" })
        })
    })
})
