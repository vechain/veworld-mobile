export const cartesian = <T extends any[]>(args: T[]) => {
    let result: T[] = []
    let max = args.length - 1
    function helper(arr: T, i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
            let a = arr.slice(0) // clone arr
            a.push(args[i][j])
            if (i === max) result.push(a as T)
            else helper(a as T, i + 1)
        }
    }
    helper([] as unknown as T, 0)
    return result
}
