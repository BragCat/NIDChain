const NIDAdminContract = artifacts.require("NIDAdmin");

contract("NIDAdmin", accounts => {
    let NIDAdmin;
    const name = "Tsinghua University";
    const admin = accounts[1];

    describe("deployment", () => {
        it("has been deployed", async() => {
            NIDAdmin = await NIDAdminContract.deployed();
            assert(NIDAdmin, "NID admin was not deployed successfully");
        });
    });

    describe("organization creation", () => {
        it("increments the organization count", async() => {
            const currentCount = await NIDAdmin.getOrganizationCount();
            await NIDAdmin.createNIDOrganization(
                name,
                {from: admin}
            );
            const newCount = await NIDAdmin.getOrganizationCount();
            assert.equal(newCount - currentCount, 1, "organization count should increment by 1");
        });
    });
});