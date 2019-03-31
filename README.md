# `@masaeedu/pmatch`

## Summary

A more convenient pattern matching syntax for ADTs constructed using [`@masaeedu/adt`](https://github.com/masaeedu/adt)

## Usage

```js
const { adt, match } = require("@masaeedu/adt");
const { pmatch } = require("@masaeedu/pmatch");

const Either = adt({ Left: ["e"], Right: ["a"] });
const { Left, Right } = Either;

// :: a -> Either e a
Either.of = Right;
// :: (a -> Either e b) -> Either e a -> Either e b
Either.chain = pmatch({
  "_ (Left e)": ({ e }) => Left(e),
  "f (Right x)": ({ f, x }) => f(x)
});
```

## Properties

TODO: Provide simple conceptual desugaring in terms of `match` from `@masaeedu/adt`

## Disclaimer

Library has no tests and will perform poorly, this is basically a toy project to understand different algorithms for implementing pattern matching
