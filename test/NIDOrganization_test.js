const NIDOrganizationContract = artifacts.require("NIDOrganization");

contract("NIDOrganization", accounts => {
    let NIDOrganization;
    const name = "Tsinghua University";
    const admin = accounts[0];
    const notAdmin = accounts[1];

    describe("initialization", () => {
        beforeEach(async () => {
            NIDOrganization = await NIDOrganizationContract.new(name, admin);
        });
        it("gets the organization name", async () => {
            const actual = await NIDOrganization.name();
            assert.equal(actual, name, "name should match");
        });
    });

    describe("key management", () => {
        const firstKey = "abcd";
        const secondKey = "efghijklmn";

        it("updates the key when called by admin", async () => {
            await NIDOrganization.updateKey(firstKey, {from: admin});
            const actualKey = await NIDOrganization.getNewestKey();
            assert.equal(actualKey, firstKey, "newest key should match");
        });

        it("throws an error when called by a non-admin user", async () => {
            try {
                await NIDOrganization.updateKey(firstKey, {from: notAdmin});
                assert.fail("update should not be permitted");
            } catch(err) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = err.reason;
                assert.equal(actualError, expectedError, "should be Ownable error");
            }
        });

        it("gets the key history", async () => {
            await NIDOrganization.updateKey(secondKey);
            const keyHistory = await NIDOrganization.getKeyHistory();
            assert.equal(keyHistory[0].key, firstKey);
            assert.equal(keyHistory[1].key, secondKey);
        });
    });
});
