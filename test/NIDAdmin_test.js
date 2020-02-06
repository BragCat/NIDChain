const NIDAdminContract = artifacts.require("NIDAdmin");

contract("NIDAdmin", accounts => {
    let NIDAdmin;
    const admin = accounts[0];
    const name = "Tsinghua University";
    const applicant = accounts[1];

    describe("deployment", () => {
        beforeEach(async() => {
            NIDAdmin = await NIDAdminContract.deployed();
        });
        it("has been deployed", async() => {
            assert(NIDAdmin, "NID admin was not deployed successfully");
        });
    });

    describe("organization application", () => {
        it("increments the count and emits the event", async() => {
            const currentCount = await NIDAdmin.getApplicationCount();
            const tx = await NIDAdmin.applyNIDOrganization(
                name,
                {from: applicant}
            );
            const newCount = await NIDAdmin.getApplicationCount();
            const expectedEvent = "OrganizationApplied";
            const actualEvent = tx.logs[tx.logs.length - 1].event;
            assert.equal(newCount - currentCount, 1, "application count should increment by 1");
            assert.equal(actualEvent, expectedEvent, "events should match");
        });
        it("throws an error when not called by applicant", async() => {
            try {
                const index = await NIDAdmin.getApplicationCount() - 1;
                await NIDAdmin.withdrawNIDOrganizationApplication(index, {from: accounts[2]});
                assert.fail("withdraw should not be permitted");
            } catch(err) {
                const expectedError = "Ownable: application withdrawal can only be requested by owner";
                const actualError = err.reason;
                assert.equal(actualError, expectedError, "errors should match");
            }
        });
        it("withdraws the application when called by applicant", async() => {
            const currentCount = await NIDAdmin.getApplicationCount();
            const tx = await NIDAdmin.withdrawNIDOrganizationApplication(currentCount - 1, {from: applicant});
            const newCount = await NIDAdmin.getApplicationCount();
            const expectedEvent = "ApplicationWithdrawed";
            const actualEvent = tx.logs[tx.logs.length - 1].event;
            assert.equal(newCount - currentCount, -1, "application count should decrement by 1");
            assert.equal(actualEvent, expectedEvent, "events should match");
        });
    });

    describe("organization review", () => {
        beforeEach(async() => {
            await NIDAdmin.applyNIDOrganization(
                name,
                {from: applicant}
            );
            await NIDAdmin.applyNIDOrganization(
                name,
                {from: applicant}
            );
        });
        it("throws an error when not called by admin", async() => {
            try {
                await NIDAdmin.approveNIDOrganizationApplication(0, {from: accounts[1]});
                assert.fail("approve should not be permitted");
            } catch(err) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = err.reason;
                assert.equal(actualError, expectedError, "should be Ownable error");
            }
            try {
                await NIDAdmin.rejectNIDOrganizationApplication(0, {from: accounts[1]});
                assert.fail("approve should not be permitted");
            } catch(err) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = err.reason;
                assert.equal(actualError, expectedError, "should be Ownable error");
            }
            try {
                await NIDAdmin.deleteNIDOrganization(0, {from: accounts[1]});
                assert.fail("approve should not be permitted");
            } catch(err) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = err.reason;
                assert.equal(actualError, expectedError, "should be Ownable error");
            }
        });
        it("approves the application when called by admin", async() => {
            const currentOrgCount = await NIDAdmin.getOrganizationCount();
            const currentAppCount = await NIDAdmin.getApplicationCount();
            const tx = await NIDAdmin.approveNIDOrganizationApplication(0);
            const newOrgCount = await NIDAdmin.getOrganizationCount();
            const newAppCount = await NIDAdmin.getApplicationCount();
            const expectedEvent = "ApplicationApproved";
            const actualEvent = tx.logs[tx.logs.length - 1].event;
            assert.equal(newOrgCount - currentOrgCount, 1, "organization count should increment by 1");
            assert.equal(newAppCount - currentAppCount, -1, "application count should decrement by 1");
            assert.equal(actualEvent, expectedEvent, "events should match");
        });
        it("rejects the application when called by admin", async() => {
            const currentOrgCount = await NIDAdmin.getOrganizationCount();
            const currentAppCount = await NIDAdmin.getApplicationCount();
            const tx = await NIDAdmin.rejectNIDOrganizationApplication(0);
            const newOrgCount = await NIDAdmin.getOrganizationCount();
            const newAppCount = await NIDAdmin.getApplicationCount();
            const expectedEvent = "ApplicationRejected";
            const actualEvent = tx.logs[tx.logs.length - 1].event;
            assert.equal(newOrgCount - currentOrgCount, 0, "organization count should stay unchanged");
            assert.equal(newAppCount - currentAppCount, -1, "application count should decrement by 1");
            assert.equal(actualEvent, expectedEvent, "events should match");
        });
        it("deletes the organization when called by admin", async() => {
            const currentOrgCount = await NIDAdmin.getOrganizationCount();
            const currentAppCount = await NIDAdmin.getApplicationCount();
            const tx = await NIDAdmin.deleteNIDOrganization(0);
            const newOrgCount = await NIDAdmin.getOrganizationCount();
            const newAppCount = await NIDAdmin.getApplicationCount();
            const expectedEvent = "OrganizationDeleted";
            const actualEvent = tx.logs[tx.logs.length - 1].event;
            assert.equal(newOrgCount - currentOrgCount, -1, "organization count should decrement by 1");
            assert.equal(newAppCount - currentAppCount, 0, "application count should stay unchanged");
            assert.equal(actualEvent, expectedEvent, "events should match");
        });
    });
});