import React from "react"
import { TestWrapper } from "~Test"
import { NFTDetailScreen } from "./NFTDetailScreen"
import { render, screen } from "@testing-library/react-native"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
import { Routes } from "~Navigation"
import {
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"

type NavigationScreenPropAlias = NativeStackScreenProps<
    RootStackParamListNFT,
    Routes.NFT_DETAILS
>

type NavigationType = NativeStackNavigationProp<
    RootStackParamListNFT,
    Routes.NFT_DETAILS,
    undefined
>

type RouteType = RouteProp<RootStackParamListNFT, Routes.NFT_DETAILS>

const findElement = async () =>
    await screen.findByTestId("NFT_Detail_Screen", {}, { timeout: 5000 })

const route = {
    key: "string",
    name: Routes.NFT_DETAILS,
    path: "string",
    params: {
        nft: {
            attributes: [
                { trait_type: "Media manipulation", value: "80" },
                { trait_type: "Special one", value: "99" },
                { trait_type: "Tactical genius", value: "76" },
            ],
            description: "I' AM José Mourinho. The Special One",
            edition: 1,
            image: "https://ipfs.io/ipfs/QmfRjdLDw5xgDysRki5TyD68mFnb3FhVSndvpJWS4dXuB8/",
            name: "Daje Roma",
            owner: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
            tokenId: 1,
            tokenURI: "ipfs://QmS84h8x6tADGfDVxWfPLMLi9jnR32svdzzbBQK3qhKBUR/1",
        },
        collectionData: {},
    },
}

const createTestProps = (): unknown & NavigationScreenPropAlias => ({
    navigation: {
        navigate: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

describe("NFTDetailScreen", () => {
    it("should render correctly", async () => {
        render(<NFTDetailScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
