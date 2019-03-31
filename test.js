const util = require("util");

const { Maybe, Either } = require("@masaeedu/fp");
const { pmatch } = require(".");

const { Left, Right } = Either;
const { Nothing, Just } = Maybe;

const log = x => console.log(util.inspect(x, { depth: null }));

const maybechain = pmatch({
  "_ (Left x)": ({ x }) => Left(x),
  "f (Right x)": ({ f, x }) => f(x)
});

const results = maybechain(Maybe.of)(Right(42));

log(results);
