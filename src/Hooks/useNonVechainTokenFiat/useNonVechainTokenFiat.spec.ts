import { renderHook } from "@testing-library/react-hooks"
import { useNonVechainTokenFiat } from "./useNonVechainTokenFiat"
import { TestHelpers, TestWrapper } from "~Test"
import { useVechainStatsTokensInfo } from "~Api/Coingecko"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"

const { token1WithCompleteInfo, token2WithCompleteInfo } = TestHelpers.data

const mockNonVeChainTokensFiat = {
    vet: {
        price_usd: "0.0240959",
        price_eur: "0.02119034",
        price_cny: "0.17577959",
        price_vet: "1",
        last_updated: 1746568022,
    },
    vtho: {
        price_usd: "0.00232783",
        price_eur: "0.00204714",
        price_cny: "0.01698154",
        price_vet: "0.09660689",
        last_updated: 1746568022,
    },
    usdglo: {
        price_usd: "1",
        price_eur: "0.879417",
        price_cny: "7.29500001",
        price_vet: "41.50083624",
        last_updated: null,
    },
    hai: {
        price_usd: "0.01704856",
        price_eur: "0.01499279",
        price_cny: "0.12436922",
        price_vet: "0.7075295",
        last_updated: 1746568022,
    },
    b3tr: {
        price_usd: "0.07306553",
        price_eur: "0.06425506",
        price_cny: "0.53301306",
        price_vet: "3.0322806",
        last_updated: 1746568026,
    },
    vot3: {
        price_usd: "0.07306553",
        price_eur: "0.06425506",
        price_cny: "0.53301306",
        price_vet: "3.0322806",
        last_updated: 1746568026,
    },
    sha: {
        price_usd: "0.00014347",
        price_eur: "0.00012617",
        price_cny: "0.00104662",
        price_vet: "0.00595412",
        last_updated: 1746568026,
    },
    veed: {
        price_usd: "0.00015364",
        price_eur: "0.00013512",
        price_cny: "0.00112083",
        price_vet: "0.00637619",
        last_updated: 1746568026,
    },
    yeet: {
        price_usd: "0.00064021",
        price_eur: "0.00056302",
        price_cny: "0.00467037",
        price_vet: "0.02656925",
        last_updated: 1746568026,
    },
    wov: {
        price_usd: "0.00111101",
        price_eur: "0.00097704",
        price_cny: "0.00810484",
        price_vet: "0.04610784",
        last_updated: 1746568026,
    },
    coj: {
        price_usd: "0.00001528",
        price_eur: "0.00001344",
        price_cny: "0.00011145",
        price_vet: "0.00063413",
        last_updated: 1746568026,
    },
    veusd: {
        price_usd: "1",
        price_eur: "0.879417",
        price_cny: "7.29500001",
        price_vet: "41.50083624",
        last_updated: 1746568022,
    },
    sht: {
        price_usd: "0.00006245",
        price_eur: "0.00005492",
        price_cny: "0.00045557",
        price_vet: "0.00259173",
        last_updated: 1746568026,
    },
    wvet: {
        price_usd: "0.0240959",
        price_eur: "0.02119034",
        price_cny: "0.17577959",
        price_vet: "1",
        last_updated: 1746568022,
    },
    vex: {
        price_usd: "0.0013386",
        price_eur: "0.00117719",
        price_cny: "0.0097651",
        price_vet: "0.05555302",
        last_updated: 1746568026,
    },
    mva: {
        price_usd: "0.01002289",
        price_eur: "0.0088143",
        price_cny: "0.07311696",
        price_vet: "0.41595832",
        last_updated: 1746568026,
    },
    vpu: {
        price_usd: "0.00617061",
        price_eur: "0.00542654",
        price_cny: "0.04501463",
        price_vet: "0.25608548",
        last_updated: 1746568026,
    },
    gold: {
        price_usd: "0.00074591",
        price_eur: "0.00065596",
        price_cny: "0.00544138",
        price_vet: "0.03095589",
        last_updated: 1746568026,
    },
    jur: {
        price_usd: "0.00022376",
        price_eur: "0.00019678",
        price_cny: "0.00163232",
        price_vet: "0.00928623",
        last_updated: 1746568026,
    },
    mvg: {
        price_usd: "0.00007877",
        price_eur: "0.00006927",
        price_cny: "0.00057459",
        price_vet: "0.00326902",
        last_updated: 1746568026,
    },
    vvet: {
        price_usd: "0.0240959",
        price_eur: "0.02119034",
        price_cny: "0.17577959",
        price_vet: "1",
        last_updated: 1746568022,
    },
    vsea: {
        price_usd: "0.00541444",
        price_eur: "0.00476155",
        price_cny: "0.03949832",
        price_vet: "0.22470379",
        last_updated: 1746568026,
    },
    oce: {
        price_usd: "0.000066",
        price_eur: "0.00005804",
        price_cny: "0.00048143",
        price_vet: "0.00273906",
        last_updated: 1746568026,
    },
    dhn: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    pla: {
        price_usd: "0.00000282",
        price_eur: "0.00000268",
        price_cny: "0.00002063",
        price_vet: "0.00011703",
        last_updated: 1695894541,
    },
    ppr: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    union: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    dragon: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    banana: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    vst: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    dbet: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    ehrt: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    tic: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    gems: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    mdn: {
        price_usd: null,
        price_eur: null,
        price_cny: null,
        price_vet: null,
        last_updated: 1746568026,
    },
    bvet: {
        price_usd: "0.0240959",
        price_eur: "0.02119034",
        price_cny: "0.17577959",
        price_vet: "1",
        last_updated: 1746568022,
    },
    squad: {
        price_usd: "0.00000118",
        price_eur: "0.00000104",
        price_cny: "0.00000859",
        price_vet: "0.00004897",
        last_updated: 1746568026,
    },
    dwvet: {
        price_usd: "0.0240959",
        price_eur: "0.02119034",
        price_cny: "0.17577959",
        price_vet: "1",
        last_updated: 1746568022,
    },
    sass: {
        price_usd: "0.00007059",
        price_eur: "0.00006208",
        price_cny: "0.00051493",
        price_vet: "0.00292954",
        last_updated: 1746568026,
    },
}

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useVechainStatsTokensInfo: jest.fn(),
}))

jest.mock("~Hooks/useNonVechainTokensBalance", () => ({
    useNonVechainTokensBalance: jest.fn(),
}))

describe("useNonVechainTokenFiat", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("returns the correct fiat balance", () => {
        ;(useVechainStatsTokensInfo as jest.Mock).mockReturnValue({
            data: mockNonVeChainTokensFiat,
        })
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [token1WithCompleteInfo, token2WithCompleteInfo],
        })

        const { result } = renderHook(() => useNonVechainTokenFiat(), {
            wrapper: TestWrapper,
        })

        expect(result.current.length).toBe(2)
        expect(result.current[0]).toBe("< < 0.01")
        expect(result.current[1]).toBe("1.4347")
    })
})
