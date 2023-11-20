export default [
    {
        "name": "test",
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
    }
];
