type IDotStyle = {
    size: number
    opacity: number
}

enum EnumDotType {
    ACTIVE,
    INACTIVE,
    MEDIUM,
    SMALL,
}

const DotStyle = {
    [EnumDotType.INACTIVE]: {
        size: 8,
        opacity: 0.2,
    },
    [EnumDotType.ACTIVE]: {
        size: 8,
        opacity: 1.0,
    },
    [EnumDotType.MEDIUM]: {
        size: 5,
        opacity: 0.2,
    },
    [EnumDotType.SMALL]: {
        size: 3,
        opacity: 0.2,
    },
}

export type getDotStylePayload = {
    idx: number
    pageIdx: number
    maxPage: number
}

/**
 *
 * Returns the style object for a dot in a pagination component based on its position and the current page.
 * @param {Object} getDotStylePayload - Object containing the current dot index, current page number, maximum page number, and an enum for different types of dots.
 * @returns {Object} - The style object for the dot.
 */
export const getDotStyle = ({
    idx,
    pageIdx,
    maxPage,
}: getDotStylePayload): IDotStyle => {
    let type = EnumDotType.SMALL

    const lessThan5Pages: boolean = maxPage < 5
    const firstThreePages: boolean = pageIdx < 3
    const fourthPage: boolean = pageIdx === 3
    const indexGreaterThanCurrentPage: boolean = idx > pageIdx
    const indexLessThanCurrentPage: boolean = idx < pageIdx

    if (lessThan5Pages) {
        return DotStyle[
            idx === pageIdx ? EnumDotType.ACTIVE : EnumDotType.INACTIVE
        ]
    }

    if (firstThreePages) {
        type = handleFirstThreePages(idx, pageIdx)
        return DotStyle[type]
    }

    if (fourthPage) {
        type = handleFourthPage(idx, pageIdx)
        return DotStyle[type]
    }

    if (indexGreaterThanCurrentPage) {
        type = handleIndexGreaterThanCurrentPage(idx, pageIdx)
        return DotStyle[type]
    }

    if (indexLessThanCurrentPage) {
        type = handleIndexLessThanCurrentPage(idx, pageIdx)
        return DotStyle[type]
    }

    return DotStyle[EnumDotType.ACTIVE]
}

const handleFirstThreePages = (idx: number, pageIdx: number): EnumDotType => {
    let type: EnumDotType
    if (idx < 3) {
        type = EnumDotType.INACTIVE
        if (pageIdx === idx) {
            type = EnumDotType.ACTIVE
        }
    } else if (idx < 4) {
        type = EnumDotType.MEDIUM
    } else {
        type = EnumDotType.SMALL
    }

    return type
}

const handleFourthPage = (idx: number, pageIdx: number): EnumDotType => {
    let type: EnumDotType

    if (idx < 4) {
        if (idx === 0) {
            type = EnumDotType.MEDIUM
        } else {
            type = EnumDotType.INACTIVE

            if (pageIdx === idx) {
                type = EnumDotType.ACTIVE
            }
        }
    } else if (pageIdx + 1 === idx) {
        type = EnumDotType.MEDIUM
    } else {
        type = EnumDotType.SMALL
    }

    return type
}

const handleIndexGreaterThanCurrentPage = (
    idx: number,
    pageIdx: number,
): EnumDotType => {
    let type = EnumDotType.SMALL
    if (idx === pageIdx + 1) {
        type = EnumDotType.MEDIUM
    }

    return type
}

const handleIndexLessThanCurrentPage = (
    idx: number,
    pageIdx: number,
): EnumDotType => {
    let type = EnumDotType.SMALL
    if (idx >= pageIdx - 2) {
        type = EnumDotType.INACTIVE
    } else if (idx === pageIdx - 3) {
        type = EnumDotType.MEDIUM
    }

    return type
}
