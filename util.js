
export default {
    /*
     * string hash function, used to generate unique IDs for algorithm functions
     * from :: https://stackoverflow.com/a/34842797
     */
    hashCode(str) {
        return str.split("").reduce((prevHash, currVal) =>
            (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
    }
};
