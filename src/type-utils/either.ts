type Left<L> = {
    readonly tag: 'left';
    readonly value: L;
};

type Right<R> = {
    readonly tag: 'right';
    readonly value: R;
};

/**
 * Types a poor man Either Monad. As per convention, the {@link L} type represents an error, while the {@link R} type the success result.
 */
export type Either<L, R> = Left<L> | Right<R>;

/**
 * Creates an {@link Either} that represents an error.
 */
export function left<L, R>(l: L): Either<L, R> {
    return <Either<L, R>>{
        tag: 'left',
        value: l
    };
}

/**
 * Creates an {@link Either} that represents a success result.
 */
export function right<L, R>(r: R): Either<L, R> {
    return <Either<L, R>>{
        tag: 'right',
        value: r
    };
}

/**
 * Folds the value of either monad by computing the left callback, if an error, or right callback if a success result.
 * 
 * @param monad - the either monad being folder
 * @param ifLeft - callback that folds an error in a common type
 * @param ifRight - callback that folds a success result in a common type
 * @returns the folded value based on the computed callbacks.
 */
export function fold<F, L, R>(monad: Either<L, R>, ifLeft: (l: L) => F, ifRight: (r: R) => F): F {
    switch (monad.tag) {
        case "left":
            return ifLeft(monad.value);
        case "right":
            return ifRight(monad.value);
    }
}
