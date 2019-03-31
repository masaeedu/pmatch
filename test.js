const util = require("util");
const { Maybe, Either } = require("@masaeedu/fp");

const test = require("ava");

const { pmatch } = require(".");

const { Left, Right } = Either;

const snap = t => x => t.snapshot(x);

test("it works", t => {
  const Prim = { equals: x => y => x === y };

  // :: Equatable e -> Equatable a -> Either e a -> Either e a -> Boolean
  const equals = E => A =>
    pmatch({
      "(Left  x) (Left  y)": ({ x, y }) => E.equals(x)(y),
      "(Right x) (Right y)": ({ x, y }) => A.equals(x)(y),
      "_         _        ": _ => false
    });

  // Deliberately using pmatch unnecessarily here to
  // test the implementation. For non-nested or non-nary
  // matches, just using `match` is more convenient
  // :: (a -> Either e b) -> Either e a -> Either e b
  const chain = pmatch({
    "_ (Left  e)": ({ e }) => Left(e),
    "f (Right a)": ({ f, a }) => f(a)
  });

  // :: Either e (Either e a) -> Either e a
  const join = pmatch({
    "(Left  e        )": ({ e }) => Left(e),
    "(Right (Right a))": ({ a }) => Right(a),
    "(Right l        )": ({ l }) => l
  });

  // :: (a -> b) -> Either e a -> Either e b
  const map = pmatch({
    "_ (Left  e)": ({ e }) => Left(e),
    "f (Right a)": ({ f, a }) => Right(f(a))
  });

  // :: (a -> Either e b) -> Either e a -> Either e b
  const chain_ = f => ma => join(map(f)(ma));

  // :: (a -> Boolean) -> a -> Either a a
  const guard = f => x => (f(x) ? Right(x) : Left(x));

  const inputs = [
    [guard(x => x > 1), Right(42)],
    [guard(x => x < 5), Right(42)],
    [guard(x => x === 42), Left("Whoops!")]
  ];

  inputs.forEach(([f, x]) => {
    const v1 = chain(f)(x);
    const v2 = chain_(f)(x);
    t.true(equals(Prim)(Prim)(v1)(v2));
    snap(t)(v1);
  });
});
