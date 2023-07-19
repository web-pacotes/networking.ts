// Big thank you (https://stackoverflow.com/a/70307091)

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Type guard to check in compile time that a number is within a number range (e.g., Byte validation => Range<0, 256>)
 */
export type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>