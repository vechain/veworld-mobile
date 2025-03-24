import { renderHook } from "@testing-library/react-native"
import { useCoinifyPay } from "./useCoinifyPay"
import { TestHelpers } from "~Test"
import { COLORS } from "~Constants"

const { account1D1 } = TestHelpers.data

describe("useCoinifyPay", () => {
    const OLD_ENV = process.env

    beforeEach(() => {
        jest.resetModules() // Most important - it clears the cache
        process.env = {
            ...OLD_ENV,
            REACT_APP_COINIFY_DEV_URL: "https://trade-ui.sandbox.coinify.com",
            REACT_APP_COINIFY_PARTNER_ID: "xcdet51e-421d-gc3d-bd90-68570fcl10e4",
        } // Make a copy
    })

    afterAll(() => {
        process.env = OLD_ENV // Restore old environment
    })

    it("Buy - Generate url with USD currency", async () => {
        const { result } = renderHook(() => useCoinifyPay({ target: "buy" }))
        const { generateOnRampURL } = result.current

        const url = generateOnRampURL({
            address: account1D1.address,
            amount: 100,
            defaultCryptoCurrency: "VET",
            defaultFiatCurrency: "USD",
            primaryColor: COLORS.PURPLE,
        })

        expect(url).toBe(
            "https://trade-ui.sandbox.coinify.com?partnerId=xcdet51e-421d-gc3d-bd90-68570fcl10e4\
            &fiatCurrencies=EUR%2CUSD\
            &cryptoCurrencies=VET\
            &transferInMedia=card%2Cbank\
            &transferOut=blockchain\
            &address=0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa\
            &defaultCryptoCurrency=VET\
            &defaultFiatCurrency=USD\
            &primaryColor=%2330265F\
            &buyAmount=100".replaceAll(" ", ""), //To make it more readable I added new lines and the remove them
        )
    })
    it("Buy - Generate url with EUR currency", async () => {
        const { result } = renderHook(() => useCoinifyPay({ target: "buy" }))
        const { generateOnRampURL } = result.current

        const url = generateOnRampURL({
            address: account1D1.address,
            amount: 100,
            defaultCryptoCurrency: "VET",
            defaultFiatCurrency: "EUR",
            primaryColor: COLORS.PURPLE,
        })

        expect(url).toBe(
            "https://trade-ui.sandbox.coinify.com?partnerId=xcdet51e-421d-gc3d-bd90-68570fcl10e4\
            &fiatCurrencies=EUR%2CUSD\
            &cryptoCurrencies=VET\
            &transferInMedia=card%2Cbank\
            &transferOut=blockchain\
            &address=0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa\
            &defaultCryptoCurrency=VET\
            &defaultFiatCurrency=EUR\
            &primaryColor=%2330265F\
            &buyAmount=100".replaceAll(" ", ""), //To make it more readable I added new lines and the remove them
        )
    })

    it("Sell - Generate url with USD currency", async () => {
        const { result } = renderHook(() => useCoinifyPay({ target: "sell" }))
        const { generateOffRampURL } = result.current

        const url = generateOffRampURL({
            address: account1D1.address,
            amount: 100,
            defaultCryptoCurrency: "VET",
            defaultFiatCurrency: "USD",
            primaryColor: COLORS.PURPLE,
        })

        expect(url).toBe(
            "https://trade-ui.sandbox.coinify.com?partnerId=xcdet51e-421d-gc3d-bd90-68570fcl10e4\
            &fiatCurrencies=EUR%2CUSD\
            &cryptoCurrencies=VET\
            &transferInMedia=blockchain\
            &transferOut=bank\
            &address=0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa\
            &defaultCryptoCurrency=VET\
            &defaultFiatCurrency=USD\
            &primaryColor=%2330265F\
            &sellAmount=100\
            &targetPage=sell".replaceAll(" ", ""), //To make it more readable I added new lines and the remove them
        )
    })
    it("Sell - Generate url with EUR currency", async () => {
        const { result } = renderHook(() => useCoinifyPay({ target: "sell" }))
        const { generateOffRampURL } = result.current

        const url = generateOffRampURL({
            address: account1D1.address,
            amount: 100,
            defaultCryptoCurrency: "VET",
            defaultFiatCurrency: "EUR",
            primaryColor: COLORS.PURPLE,
        })

        expect(url).toBe(
            "https://trade-ui.sandbox.coinify.com?partnerId=xcdet51e-421d-gc3d-bd90-68570fcl10e4\
            &fiatCurrencies=EUR%2CUSD\
            &cryptoCurrencies=VET\
            &transferInMedia=blockchain\
            &transferOut=bank\
            &address=0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa\
            &defaultCryptoCurrency=VET\
            &defaultFiatCurrency=EUR\
            &primaryColor=%2330265F\
            &sellAmount=100\
            &targetPage=sell".replaceAll(" ", ""), //To make it more readable I added new lines and the remove them
        )
    })
})
