export default [
    {
        "name": "worble",
        "mods": [
            {
                name: "x",
                integerMode: false
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
                name: "dividend",
                integerMode: true
            },
            {
                name: "divisor",
                integerMode: true
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
                name: "triggers",
                integerMode: true
            },
            {
                name: "rotation",
                integerMode: true
            }
        ],
        "fn": (t, seqlen, mod) => {
            return (((mod[0] * (t + mod[1])) % seqlen) + mod[0]) >= seqlen;
        }
    }
];
