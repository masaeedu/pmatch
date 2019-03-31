const { adt, match } = require("@masaeedu/adt");
const { Fn, Arr, Str } = require("@masaeedu/fp");
const P = require("nanoparsec");

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

const patterns = Fn.passthru(pattern)([
  P.sepBy(P.spaces),
  P.surroundedBy(P.spaces)
]);

module.exports = { Con, Var, patterns };
