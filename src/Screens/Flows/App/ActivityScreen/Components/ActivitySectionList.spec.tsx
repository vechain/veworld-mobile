import { render } from "@testing-library/react-native"
import { ActivitySectionList } from "./ActivitySectionList"
import React from "react"
import { TestWrapper } from "~Test"
import { Activity, ActivityStatus, ActivityType, FungibleTokenActivity, NonFungibleTokenActivity } from "~Model"
import { DIRECTIONS } from "~Constants"

const fetchActivitiesMock = jest.fn()
const refreshActivitiesMock = jest.fn()

const activities: Activity[] = [
    {
        id: "1",
        timestamp: 1717334400,
        from: "0x123",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        type: ActivityType.TRANSFER_FT,
        direction: DIRECTIONS.UP,
        blockNumber: 1,
        txId: "1",
        genesisId: "1",
        gasUsed: 1,
        clauses: [],
        delegated: false,
        amount: "100",
        tokenAddress: "0x123",
    } as FungibleTokenActivity,
    {
        id: "1",
        timestamp: 1717334400,
        from: "0x123",
        isTransaction: true,
        status: ActivityStatus.SUCCESS,
        type: ActivityType.TRANSFER_NFT,
        direction: DIRECTIONS.UP,
        blockNumber: 1,
        txId: "1",
        genesisId: "1",
        gasUsed: 1,
        clauses: [],
        delegated: false,
        tokenAddress: "0x123",
        tokenId: "1",
        contractAddress: "0x123457734294983247234827",
    } as NonFungibleTokenActivity,
]

describe("ActivitySectionList", () => {
    it("should render the activity section list", () => {
        render(
            <ActivitySectionList
                activities={activities}
                fetchActivities={fetchActivitiesMock}
                refreshActivities={refreshActivitiesMock}
                isFetching={false}
                isRefreshing={false}
                veBetterDaoDapps={[]}
            />,
            { wrapper: TestWrapper },
        )
    })
})
