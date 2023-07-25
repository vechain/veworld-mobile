import { FungibleTokenWithBalance, NonFungibleToken, Token } from "~Model"
import { account1D1 } from "./accounts"
import { VET, VTHO, defaultMainNetwork } from "~Constants"

export const VETWithBalance: FungibleTokenWithBalance = {
    ...VET,
    balance: {
        balance: "35",
        tokenAddress: VET.address,
        genesisId: defaultMainNetwork.genesis.id,
        accountAddress: account1D1.address,
        timeUpdated: Date.now().toString(),
    },
}

export const VTHOWithBalance: FungibleTokenWithBalance = {
    ...VTHO,
    balance: {
        balance: "113",
        tokenAddress: VTHO.address,
        genesisId: defaultMainNetwork.genesis.id,
        accountAddress: account1D1.address,
        timeUpdated: Date.now().toString(),
    },
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

export const token2: Token = {
    name: "Safe Haven",
    symbol: "SHA",
    address: "0x5db3c8a942333f6468176a870db36eef120a34dc",
    icon,
    custom: false,
}

export const tokensMock = [token1, token2]

export const NFT_Mock: NonFungibleToken = {
    attributes: [{ trait_type: "Nature", value: "100" }],
    contractAddress: "0xa00c0b2b042b10402719cf0805054205c5c97fd2",
    description: "Random",
    id: "0xa00c0b2b042b10402719cf0805054205c5c97fd2190x231E70Cf27A2c44Eb9C00a3B1d2F7507Ae791051",
    image: "https://ipfs.io/ipfs/QmW3m2WVPSx9Dr5pkDa14TGCV9s8zeo2sSadmonaGE86nx/",
    name: "Taci",
    owner: "0x231E70Cf27A2c44Eb9C00a3B1d2F7507Ae791051",
    tokenId: "19",
    tokenURI: "ipfs://QmegDncWdw5XqZLmQai39tbpjwPriMRngzsmc51T89zQDy/19",
    mimeType: "image/png",
}
