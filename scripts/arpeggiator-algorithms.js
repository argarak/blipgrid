export default [
    {
        name: "modulo motion",
        mods: [
            {
                name: "loop",
                integerMode: true,
                min: 1,
            },
            {
                name: "step",
                integerMode: true,
                min: 1,
            },
            {
                name: "direction",
                integerMode: true,
                min: 0,
                max: 2,
            },
        ],
        fn: (t, scale, mod) => {
            function modulo(n, m) {
                return ((n % m) + m) % m;
            }

            let x;
            if (mod[2] === 0) {
                x = t;
            } else if (mod[2] === 1) {
                x = -t;
            } else {
                x = t % mod[0] > mod[0] / 2 ? t : -t;
            }

            let out = modulo(x * mod[1], mod[0]) % scale.length;
            return out;
        },
    },

    {
        name: "sine walk",
        mods: [
            {
                name: "frequency",
                integerMode: true,
                min: 1,
            },
            {
                name: "phase",
                integerMode: true,
                min: -64,
            },
        ],
        fn: (t, scale, mod) => {
            return (
                Math.abs(Math.round(Math.sin(t * mod[0] + mod[1]) * 64)) %
                scale.length
            );
        },
    },
];
