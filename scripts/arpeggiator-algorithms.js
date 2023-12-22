export default [
    {
        "name": "ascending modulo",
        "mods": [
            {
                name: "loop",
                integerMode: true,
                min: 1
            },
            {
                name: "octave",
                integerMode: true,
                min: 1
            }
        ],
        "fn": (t, scale, mod) => {
            return [(t % mod[0]) % scale.length, mod[1]];
        }
    },

    {
        "name": "sine walk",
        "mods": [
            {
                name: "frequency",
                integerMode: true,
                min: 1
            },
            {
                name: "octave",
                integerMode: true,
                min: 1
            }
        ],
        "fn": (t, scale, mod) => {
            return [Math.abs(Math.round(Math.sin(t * mod[0]) * 64)) % scale.length, 1];
        }
    }
];
