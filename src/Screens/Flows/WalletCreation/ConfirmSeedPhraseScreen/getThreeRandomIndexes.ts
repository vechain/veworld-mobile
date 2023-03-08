const TOTAL_WORDS = 12

export const getThreeRandomIndexes = (): number[] => {
    const maxIndex = TOTAL_WORDS - 1
    const result: number[] = []

    // generate first number
    const maxIndexForFirstNumber = maxIndex - 2
    const firstNumber = Math.floor(Math.random() * maxIndexForFirstNumber + 1)
    result.push(firstNumber)

    // generate second number
    const minIndexForSecondNumber = firstNumber + 1
    const maxIndexForSecondNumber = maxIndex - 1
    const getSecondNumber = () =>
        Math.floor(
            Math.random() *
                (maxIndexForSecondNumber - minIndexForSecondNumber + 1),
        ) + minIndexForSecondNumber
    let secondNumber = getSecondNumber()
    // ensure that the second number is not equal to the first number
    while (secondNumber === firstNumber) {
        const newNumber = getSecondNumber()
        secondNumber = newNumber
    }
    result.push(secondNumber)

    // generate third number
    const minIndexForThirdNumber = secondNumber + 1
    const maxIndexForThirdNumber = maxIndex
    const getThirdNumber = () =>
        Math.floor(
            Math.random() *
                (maxIndexForThirdNumber - minIndexForThirdNumber + 1),
        ) + minIndexForThirdNumber
    let thirdNumber = getThirdNumber()
    while (thirdNumber === firstNumber || thirdNumber === secondNumber) {
        // Ensure that the third number is not equal to the first or second number
        const newNumber = getThirdNumber()
        thirdNumber = newNumber
    }
    result.push(thirdNumber)

    return result
}
