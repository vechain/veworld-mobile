import React, { useCallback, useState } from "react"
import { BaseText } from "~Components/Base"
import { typography } from "~Constants"

const { defaults: defaultTypography, ...otherTypography } = typography

type Props = {
    text: string
    numberOfLines?: number
    typographyFont?: keyof typeof defaultTypography
    fontSize?: keyof typeof otherTypography.fontSize
    fontWeight?: keyof typeof otherTypography.fontWeight
    fontFamily?: keyof typeof otherTypography.fontFamily
}

export const CompressAndExpandBaseText = ({
    text,
    numberOfLines = 4,
    typographyFont,
    fontSize,
    fontWeight,
    fontFamily,
}: Props) => {
    const [textShown, setTextShown] = useState(false) //To show ur remaining Text
    const [lengthMore, setLengthMore] = useState(false) //to show the "Read more & Less Line"
    const toggleNumberOfLines = () => {
        //To toggle the show text or hide it
        setTextShown(!textShown)
    }

    const onTextLayout = useCallback(
        (e: any) => {
            setLengthMore(e.nativeEvent.lines.length >= numberOfLines) //to check the text is more than 4 lines or not
            // console.log(e.nativeEvent);
        },
        [numberOfLines],
    )

    return (
        <>
            <BaseText
                onTextLayout={onTextLayout}
                numberOfLines={textShown ? undefined : numberOfLines}
                typographyFont={typographyFont}
                fontSize={fontSize}
                fontWeight={fontWeight}
                fontFamily={fontFamily}
                ellipsizeMode="tail">
                {text}
            </BaseText>
            {lengthMore ? (
                <BaseText
                    onPress={toggleNumberOfLines}
                    typographyFont="subSubTitle"
                    underline={true}>
                    {textShown ? "See less" : "See more"}
                </BaseText>
            ) : null}
        </>
    )
}
