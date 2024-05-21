# @web-pacotes/networking

## 0.0.11

### Patch Changes

- 3e2ee2e: fix: remove any suffixes when resolving media type value in extractBody

## 0.0.10

### Patch Changes

- cb45411: refactor: replace MediaType enum with union type

## 0.0.9

### Patch Changes

- c8691fb: refactor: replace internal monads with those provided in @web-pacotes/foundation-types

## 0.0.8

### Patch Changes

- 8fa5b1b: chore: set package type as module and replace swc with esbuild

## 0.0.7

### Patch Changes

- 8e25d31: fix: bundle .mjs

## 0.0.6

### Patch Changes

- 7796558: fix: export FetchClient type

## 0.0.5

### Patch Changes

- d715d73: bugfix: web example demo merge conflitcts

## 0.0.4

### Patch Changes

- 77e05ad: bugfix: fill cache and cors in copyWith
  bugfix: disable dark mode for web demo
  feat: isLeft and isRight predicates
  bugfix: not able to pass object values directly in post function
  refactor: replace granular HttpResponse types with type guards
  feat: add way to access http body in a typed way
  fix: web demo gh action not being able to access temp dir
  docs: add usage and motivations

## 0.0.3

### Patch Changes

- 9a70606: bugfix: cache and cors properties not being filled after copyWith

## 0.0.2

### Patch Changes

- 4bed920: add support for cache and cors modes

## 0.0.1

### Patch Changes

- acf7869: initial release of networking.ts
