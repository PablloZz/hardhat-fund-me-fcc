const { run } = require("hardhat");

const verify = async (address, args) => {
  console.log("Verifying a contract...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(error);
    }
  }
};

module.exports = { verify };
