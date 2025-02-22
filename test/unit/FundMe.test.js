const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.parseUnits("1.0");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.target);
        });
      });

      describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("Update the address to amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to array of getFunder", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single founder", async function () {
          beforeEach(async function () {
            fundMe.fund({ value: sendValue });
          });

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingDeployerBalance + startingFundMeBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );
        });
        it("Allows to withdraw with multiple getFunder", async function () {
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 5; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingDeployerBalance + startingFundMeBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 5; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const fundMeConnectedContract = fundMe.connect(accounts[1]);
          await expect(
            fundMeConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(
            fundMeConnectedContract,
            "FundMe_NotOwner"
          );
        });

        it("Cheaper withdraw testing...", async function () {
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 5; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingDeployerBalance + startingFundMeBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 5; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Cheaper", async function () {
          beforeEach(async function () {
            fundMe.fund({ value: sendValue });
          });

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );

          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingDeployerBalance + startingFundMeBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );
        });
      });
    });
