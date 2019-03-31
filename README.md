# `@masaeedu/pmatch`

## Summary

A more convenient pattern matching syntax for ADTs constructed using [`@masaeedu/adt`](https://github.com/masaeedu/adt)

## Usage

```js
const { adt, match } = require("@masaeedu/adt");
const { pmatch } = require("@masaeedu/pmatch");

const Either = adt({ Left: ["e"], Right: ["a"] });
const { Left, Right } = Either;

// Can be used to match over multiple arguments
// :: Equatable e -> Equatable a -> Either e a -> Either e a -> Boolean
Either.equals = E => A =>
  pmatch({
    "(Left  x) (Left  y)": ({ x, y }) => E.equals(x)(y),
    "(Right x) (Right y)": ({ x, y }) => A.equals(x)(y)
    "_         _        ": _ => false
  });

// Also handy when matching over nested ADTs
// :: Either e (Either e a) -> Either e a
Either.join = pmatch({
  "(Left  e        )": ({ e }) => Left(e),
  "(Right (Right a))": ({ a }) => Right(a),
  "(Right l        )": ({ l }) => l
});
```

## Properties

TODO: Provide simple conceptual desugaring in terms of `match` from `@masaeedu/adt`

## Disclaimer

Library has no tests and will perform poorly, this is basically a toy project to understand different algorithms for implementing pattern matching
