export default [
    {
        "name": "worble",
        "mods": 1,
        "fn": (t, seqlen, mod) => {
            return Math.sin(t ** mod[0]*2) > mod[0] / seqlen;
        }
    },

    {
        "name": "modulo",
        "mods": 2,
        "fn": (t, seqlen, mod) => {
            return t % mod[0] == mod[1];
        }
    }
];
