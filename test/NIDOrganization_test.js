const NIDOrganizationContract = artifacts.require("NIDOrganization");

contract("NIDOrganization", () => {
    let NIDOrganization;
    const name = "Tsinghua University";
    describe("initialization", () => {
        beforeEach (async () => {
            NIDOrganization = await NIDOrganizationContract.new(name);
        });
        it("gets the organization name", async () => {
            const actual = await NIDOrganization.name();
            assert.equal(actual, name, "name should match");
        });
    });

    describe("update the key", () => {
        const firstKey = "abcd";
        const secondKey = "efghijklmn";
        it("sets and gets the recent key", async () => {
            await NIDOrganization.updateKey(firstKey);
            const actualKey = await NIDOrganization.getNewestKey();
            assert.equal(actualKey, firstKey, "newest key should match");
        });

        it("gets the key history", async () => {
            await NIDOrganization.updateKey(secondKey);
            const keyHistory = await NIDOrganization.getKeyHistory();
            assert.equal(keyHistory[0].key, firstKey);
            assert.equal(keyHistory[1].key, secondKey);
        });
    });
});