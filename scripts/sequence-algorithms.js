export default [
    {
        name: "euclidean",
        mods: [
            {
                name: "triggers",
                integerMode: true,
            },
            {
                name: "rotation",
                integerMode: true,
                min: 1,
            },
        ],
        fn: (t, seqlen, mod) => {
            return ((mod[0] * (t + mod[1])) % seqlen) + mod[0] >= seqlen;
        },
    },

    {
        name: "modulo",
        mods: [
            {
                name: "divisor",
                integerMode: true,
            },
            {
                name: "rotation",
                integerMode: true,
            },
        ],
        fn: (t, seqlen, mod) => {
            return t % mod[0] == mod[1] % mod[0];
        },
    },

    {
        name: "sine threshold",
        mods: [
            {
                name: "threshold",
                integerMode: false,
            },
            {
                name: "frequency",
                integerMode: false,
            },
            {
                name: "FM level",
                integerMode: false,
            },
        ],
        fn: (t, seqlen, mod) => {
            return (
                Math.sin(t * mod[1] * (Math.sin(t * mod[1]) * mod[2])) * 64 >
                mod[0]
            );
        },
    },

    {
        name: "worble",
        mods: [
            {
                name: "x",
                integerMode: false,
            },
        ],
        fn: (t, seqlen, mod) => {
            return Math.sin(t ** mod[0] * 2) > mod[0] / seqlen;
        },
    },
];
