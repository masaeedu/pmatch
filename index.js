const { adt, match, otherwise } = require("@masaeedu/adt");
const P = require("nanoparsec");
const { Fn, Obj, Arr, Vec, Str, Either, Maybe, fail } = require("@masaeedu/fp");

const { Left, Right } = Either;
const { Just, Nothing } = Maybe;

Maybe.guarantee = e =>
  match({
    get Nothing() {
      return fail(e);
    },
    Just: Fn.id
  });
Either.guarantee = match({ Left: fail, Right: Fn.id });

const { Con, Var } = adt({
  Con: ["String", "x"],
  Var: ["String"]
});

const upcase = P.regex(/[A-Z]/);
const locase = P.regex(/[a-z_]/);
const rest = P.regex(/[A-Za-z\d-_]*/);

const label = P.lift2(Str.append)(upcase)(rest);
const hole = P.lift2(Str.append)(locase)(rest);

const pattern = Arr.asum(P)([
  P.map(l => Con(l)([]))(label),

  P.map(([, l, , v]) => Con(l)(v))(
    Arr.sequence(P)([
      P.char("("),
      label,
      P.spaces,
      s => patterns(s),
      P.char(")")
    ])
  ),

  P.map(Var)(hole)
]);

const patterns = P.sepBy(P.spaces)(pattern);

// Validate that all the arities match up
const validateArity = pats => {
  const arities = Arr.dedupe(Arr.map(Arr.length)(pats));

  return arities.length > 1
    ? Left("All cases in pattern match must be of identical arity")
    : Right({ length: arities[0], pats });
};

const { Failure, Partial, Success } = adt({
  Failure: [],
  Partial: ["?", "?"],
  Success: ["String", "?"]
});

const matchArg = match({
  Con: name => ps =>
    match({
      [name]: Fn.curryN(ps.length)(Partial(ps)),
      [otherwise]: _ => Failure
    }),
  Var: Success
});

// For each pattern, produce either:
// 1. a failure to match
// 2. a partial match that needs more nested pattern matching to complete, or
// 3. a successful match
// where "a match" is a labelled value that's been extracted from the arg list
const matchRule = ps => vs =>
  Fn.passthru([ps, vs])([
    Fn.uncurry(Arr.zipWith(matchArg)),
    Arr.foldMap(Maybe.monoid(Obj))(
      match({
        Failure: Nothing,
        Success: name => v => Just({ [name]: v }),
        Partial: matchRule
      })
    )
  ]);

// Match a bunch of rules and produce the index and extracted
// data for the first successful one
const matchRules = pats => vs =>
  Fn.passthru(pats)([
    // Try every pattern against the args
    Arr.mapWithKey(i => ps => Maybe.map(r => ({ i, r }))(matchRule(ps)(vs))),
    // Take the first successful match
    Arr.asum(Maybe)
  ]);

const pmatch = cases => {
  const handlers = Obj.values(cases);
  return Fn.passthru(cases)([
    Obj.keys,
    // Parse each key into an argument pattern list
    Arr.traverse(Either)(P.run(patterns)),
    // Validate structure of pattern match
    Either["=<<"](validateArity),
    // If there were problems, explode
    Either.guarantee,
    // Produce a function that consumes arguments
    // and matches against the validated patterns
    ({ length, pats }) =>
      Fn.curryN(length)(
        Fn.pipe([
          // Find the first successful match
          matchRules(pats),
          Maybe.guarantee("No patterns matched!"),
          // Feed the extracted values into the
          // appropriate handler
          ({ i, r }) => handlers[i](r)
        ])
      )
  ]);
};

module.exports = { pmatch };
