/* eslint-disable no-console */
/**
 * Call function and monitor how long it took to perform, with the {@link performance.now} function. Logs the result in the console with the parameter {@link prefix}
 * @param fn Function to call
 * @param prefix String prefix to show it in the logs
 * @returns Result of the function {@link fn}
 */
export const withPerf = async <T extends () => any>(
    fn: T,
    prefix: string,
): Promise<ReturnType<T> extends Promise<any> ? Awaited<ReturnType<T>> : Promise<ReturnType<T>>> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    console.log(prefix, end - start)
    return result
}
