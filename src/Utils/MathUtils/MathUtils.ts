const getOdd = (num: number) => {
    return num % 2 !== 0
}

const getEven = (num: number) => {
    return num % 2 === 0
}

export default { getOdd, getEven }
