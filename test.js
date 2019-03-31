const util = require("util");
const { Maybe, Either } = require("@masaeedu/fp");

const test = require("ava");

const { pmatch } = require(".");

const { Left, Right } = Either;
const { Nothing, Just } = Maybe;

const snap = t => x => t.snapshot(x);

test("it works", t => {
  const f = pmatch({
    "_ (Left x)": ({ x }) => Left(x),
    "f (Right x)": ({ f, x }) => f(x)
  });

  const guard = f => x => (f(x) ? Right(x) : Left(x));

  const results = [
    f(guard(x => x > 1))(Right(42)),
    f(guard(x => x < 5))(Right(42)),
    f(guard(x => x === 42))(Left("Whoops!"))
  ];

  results.forEach(snap(t));
});
