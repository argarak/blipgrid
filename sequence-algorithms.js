export default [
    {
        "name": "worble",
        "mods": [
            {
                name: "x"
            }
        ],
        "fn": (t, seqlen, mod) => {
            return Math.sin(t ** mod[0]*2) > mod[0] / seqlen;
        }
    },

    {
        "name": "modulo",
        "mods": [
            {
                name: "dividend"
            },
            {
                name: "divisor"
            }
        ],
        "fn": (t, seqlen, mod) => {
            return t % mod[0] == mod[1] % mod[0];
        }
    },

    {
        "name": "euclidean",
        "mods": [
            {
                name: "triggers"
            },
            {
                name: "rotation"
            }
        ],
        "fn": (t, seqlen, mod) => {
            return (((mod[0] * (t + mod[1])) % seqlen) + mod[0]) >= seqlen;
        }
    }
];
