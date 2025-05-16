/* eslint-disable max-len */
import { B3TR, VET, VOT3, VTHO } from "~Constants"
import { TokenWithCompleteInfo } from "~Hooks"
import { FungibleTokenWithBalance, NFTMediaType, NonFungibleToken, Token } from "~Model"

export const VETWithBalance: FungibleTokenWithBalance = {
    ...VET,
    balance: {
        balance: "35",
        tokenAddress: VET.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const VTHOWithBalance: FungibleTokenWithBalance = {
    ...VTHO,
    balance: {
        balance: "113",
        tokenAddress: VTHO.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const B3TRWithBalance: FungibleTokenWithBalance = {
    ...B3TR,
    balance: {
        balance: "113575916294516129032255",
        tokenAddress: B3TR.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const VOT3WithBalance: FungibleTokenWithBalance = {
    ...VOT3,
    balance: {
        balance: "10259472020000000000000",
        tokenAddress: VOT3.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const B3TRWithCompleteInfo: TokenWithCompleteInfo = {
    ...B3TR,
    exchangeRateCurrency: "USD",
    exchangeRateLoading: false,
    fiatBalance: "0",
    tokenInfoLoading: true,
    tokenUnitBalance: "113,575.91",
    tokenUnitFullBalance: "113,575.9162945161",
    chartData: undefined,
    exchangeRate: undefined,
    tokenInfo: undefined,
    balance: B3TRWithBalance.balance,
}

export const VOT3WithCompleteInfo: TokenWithCompleteInfo = {
    ...VOT3,
    exchangeRateCurrency: "USD",
    exchangeRateLoading: false,
    fiatBalance: "0",
    tokenInfoLoading: false,
    tokenUnitBalance: "10,259.47",
    tokenUnitFullBalance: "10,259.4720200000",
    chartData: undefined,
    exchangeRate: undefined,
    tokenInfo: undefined,
    balance: VOT3WithBalance.balance,
}

const icon =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjI3LjAzOTk5cHQiIGhlaWdodD0iMjI3LjAzOTk5cHQiIHZpZXdCb3g9IjAgMCAyMjcuMDM5OTkgMjI3LjAzOTk5IiB2ZXJzaW9uPSIxLjEiPgo8ZGVmcz4KPGc+CjxzeW1ib2wgb3ZlcmZsb3c9InZpc2libGUiIGlkPSJnbHlwaDAtMCI+CjxwYXRoIHN0eWxlPSJzdHJva2U6bm9uZTsiIGQ9IiIvPgo8L3N5bWJvbD4KPHN5bWJvbCBvdmVyZmxvdz0idmlzaWJsZSIgaWQ9ImdseXBoMC0xIj4KPHBhdGggc3R5bGU9InN0cm9rZTpub25lOyIgZD0iTSAxNi4yMzQzNzUgLTQ1LjA5Mzc1IEMgMTMuNzM0Mzc1IC00NS4wOTM3NSAxMS42Mjg5MDYgLTQ1Ljk2ODc1IDkuOTIxODc1IC00Ny43MTg3NSBDIDguMjEwOTM4IC00OS40NzY1NjMgNy4zNTkzNzUgLTUxLjU2MjUgNy4zNTkzNzUgLTUzLjk2ODc1IEMgNy4zNTkzNzUgLTU2LjQ2ODc1IDguMjEwOTM4IC01OC41NzAzMTMgOS45MjE4NzUgLTYwLjI4MTI1IEMgMTEuNjI4OTA2IC02MS45ODgyODEgMTMuNzM0Mzc1IC02Mi44NDM3NSAxNi4yMzQzNzUgLTYyLjg0Mzc1IEMgMTguNzQyMTg4IC02Mi44NDM3NSAyMC44NDc2NTYgLTYxLjk4ODI4MSAyMi41NDY4NzUgLTYwLjI4MTI1IEMgMjQuMjUzOTA2IC01OC41NzAzMTMgMjUuMTA5Mzc1IC01Ni40Njg3NSAyNS4xMDkzNzUgLTUzLjk2ODc1IEMgMjUuMTA5Mzc1IC01MS41NjI1IDI0LjI1MzkwNiAtNDkuNDc2NTYzIDIyLjU0Njg3NSAtNDcuNzE4NzUgQyAyMC44NDc2NTYgLTQ1Ljk2ODc1IDE4Ljc0MjE4OCAtNDUuMDkzNzUgMTYuMjM0Mzc1IC00NS4wOTM3NSBaIE0gMTYuMjM0Mzc1IC00NS4wOTM3NSAiLz4KPC9zeW1ib2w+CjwvZz4KPGNsaXBQYXRoIGlkPSJjbGlwMSI+CiAgPHBhdGggZD0iTSAwIDAgTCAyMjcgMCBMIDIyNyAyMjcuMDExNzE5IEwgMCAyMjcuMDExNzE5IFogTSAwIDAgIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPGcgaWQ9InN1cmZhY2UxOTYiPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDEpIiBjbGlwLXJ1bGU9Im5vbnplcm8iPgo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6cmdiKDEwMCUsMTAwJSwxMDAlKTtmaWxsLW9wYWNpdHk6MDsiIGQ9Ik0gMCAtODg1MyBMIDIyNyAtODg1MyBMIDIyNyAxNTU5NDguOTkyMTg4IEwgMCAxNTU5NDguOTkyMTg4IFogTSAwIC04ODUzICIvPgo8L2c+CjxnIHN0eWxlPSJmaWxsOnJnYigwJSwwJSwwJSk7ZmlsbC1vcGFjaXR5OjE7Ij4KICA8dXNlIHhsaW5rOmhyZWY9IiNnbHlwaDAtMSIgeD0iOTcuMzk4MTIxIiB5PSIxNjAuODU0MTQiLz4KPC9nPgo8L2c+Cjwvc3ZnPgo="

export const token1: Token = {
    name: "Plair",
    symbol: "PLA",
    address: "0x89827f7bb951fd8a56f8ef13c5bfee38522f2e1f",
    icon,
    custom: false,
}

export const token1WithBalance: FungibleTokenWithBalance = {
    ...token1,
    decimals: 18,
    balance: {
        balance: "100",
        tokenAddress: token1.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const token1WithCompleteInfo: TokenWithCompleteInfo = {
    ...token1,
    decimals: 18,
    exchangeRateCurrency: "USD",
    exchangeRateLoading: false,
    fiatBalance: "0",
    tokenInfoLoading: false,
    tokenUnitBalance: "100",
    tokenUnitFullBalance: "100",
    chartData: undefined,
    exchangeRate: undefined,
    tokenInfo: undefined,
    balance: token1WithBalance.balance,
}

export const token2: Token = {
    name: "Safe Haven",
    symbol: "SHA",
    address: "0x5db3c8a942333f6468176a870db36eef120a34dc",
    icon,
    custom: false,
}

export const token2WithBalance: FungibleTokenWithBalance = {
    ...token2,
    decimals: 18,
    balance: {
        balance: "10000000000000000000000",
        tokenAddress: token2.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const token2WithCompleteInfo: TokenWithCompleteInfo = {
    ...token2,
    decimals: 18,
    exchangeRateCurrency: "USD",
    exchangeRateLoading: false,
    fiatBalance: "0",
    tokenInfoLoading: false,
    tokenUnitBalance: "10000000000000000000000",
    tokenUnitFullBalance: "10000000000000000000000",
    chartData: undefined,
    exchangeRate: undefined,
    tokenInfo: undefined,
    balance: token2WithBalance.balance,
}

export const customToken: Token = {
    name: "MyToken",
    symbol: "MTKN",
    address: "0x0c77f2c75e1833e4e437ff52107a2bb4f0a8feea",
    icon,
    custom: true,
}

export const VeBitcoin: Token = {
    name: "BTC@vechain",
    symbol: "BTC",
    address: "0x2099f5c6e20e1be2ead225ea77a6393f08dc652a",
    icon,
    crossChainProvider: {
        name: "wanchain",
        url: "https://wanchain.org",
    },
    custom: false,
}

export const VeBitcoinWithBalance: FungibleTokenWithBalance = {
    ...VeBitcoin,
    decimals: 8,
    balance: {
        balance: "10",
        tokenAddress: VeBitcoin.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const VeBitcoinWithCompleteInfo: TokenWithCompleteInfo = {
    ...VeBitcoin,
    decimals: 8,
    exchangeRateCurrency: "USD",
    exchangeRateLoading: false,
    fiatBalance: "1.032.453",
    tokenInfoLoading: false,
    tokenUnitBalance: "10",
    tokenUnitFullBalance: "1000000000",
    chartData: undefined,
    exchangeRate: 103245.3,
    tokenInfo: undefined,
    balance: VeBitcoinWithBalance.balance,
}

export const VeEthereum: Token = {
    name: "VeEthereum",
    symbol: "ETH",
    address: "0xad35f6241b8860aaaf3e12729425c624f4c5cb64",
    icon,
    crossChainProvider: {
        name: "wanchain",
        url: "https://wanchain.org",
    },
    custom: false,
}

export const VeEthereumWithBalance: FungibleTokenWithBalance = {
    ...VeEthereum,
    decimals: 18,
    balance: {
        balance: "12400000000000000000000",
        tokenAddress: VeEthereum.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const CustomTokenWithBalance: FungibleTokenWithBalance = {
    ...customToken,
    decimals: 18,
    balance: {
        balance: "10459472020000000000000",
        tokenAddress: customToken.address,
        timeUpdated: Date.now().toString(),
        isHidden: false,
    },
}

export const tokensMock = [token1, token2]

export const NFT_Mock: NonFungibleToken = {
    attributes: [{ trait_type: "Nature", value: "100" }],
    address: "0xa00c0b2b042b10402719cf0805054205c5c97fd2",
    description: "Random",
    id: "0xa00c0b2b042b10402719cf0805054205c5c97fd2190x231E70Cf27A2c44Eb9C00a3B1d2F7507Ae791051",
    image: "https://ipfs.io/ipfs/QmW3m2WVPSx9Dr5pkDa14TGCV9s8zeo2sSadmonaGE86nx/",
    name: "Taci",
    owner: "0x231E70Cf27A2c44Eb9C00a3B1d2F7507Ae791051",
    tokenId: "19",
    tokenURI: "ipfs://QmegDncWdw5XqZLmQai39tbpjwPriMRngzsmc51T89zQDy/19",
    mimeType: "image/png",
    mediaType: NFTMediaType.IMAGE,
    updated: true,
}
