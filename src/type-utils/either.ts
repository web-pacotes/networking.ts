/**
 * Types a poor man Either Monad. As per convention, the {@link L} type represents an error, while the {@link R} type the success result.
 */
export type Either<L, R> = L | R;
