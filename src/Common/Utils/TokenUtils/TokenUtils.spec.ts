import { FungibleToken } from "~Model/Token"
import { VET, VTHO } from "../../constants/Token/TokenConstants"
import ThorConstants from "../../constants/Thor"
import TokenUtils from "./TokenUtils"

export const External: FungibleToken = {
    name: "Test",
    symbol: "EXT",
    address: "0x00032020",
    decimals: 18,
    icon: "http://blah.sdf",
    genesisId: ThorConstants.genesises.test.id,
}

test("isExternalToken - VET", () => {
    expect(
        TokenUtils.isExternalToken({
            ...VET,
            genesisId: ThorConstants.genesises.test.id,
        }),
    ).toBeFalsy()
})

test("isExternalToken - VTHO", () => {
    expect(
        TokenUtils.isExternalToken({
            ...VTHO,
            genesisId: ThorConstants.genesises.test.id,
        }),
    ).toBeFalsy()
})

test("isExternalToken - External", () => {
    expect(TokenUtils.isExternalToken(External)).toBeTruthy()
})
