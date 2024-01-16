export interface Unsuccessful {
    success: false
    err: string
}

export interface Success<T> {
    success: true
    payload: T
}

export type Response<T> = Promise<Success<T> | Unsuccessful>
