import React, { useState } from "react"
import { BaseText, BaseView } from "~Components"
import { Fonts } from "~Model"

export const CoinList = () => {
    const [data] = useState([...new Array(80).keys()])

    return (
        <BaseView>
            {data.map(item => (
                <BaseText font={Fonts.sub_title} key={item}>
                    {item}
                </BaseText>
            ))}
        </BaseView>
    )
}
