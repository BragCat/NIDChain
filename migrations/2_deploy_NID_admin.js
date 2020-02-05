const NIDAdminContract = artifacts.require("NIDAdmin");

module.exports = function(deployer) {
    deployer.deploy(NIDAdminContract);
}