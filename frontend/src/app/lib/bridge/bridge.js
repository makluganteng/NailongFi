const { LxLyClient, use } = require('@maticnetwork/lxlyjs');
const { Web3ClientPlugin } = require('@maticnetwork/maticjs-web3');

use(Web3ClientPlugin)

const getLxLyClient = async (network = 'testnet', userAddress) => {
    const lxLyClient = new LxLyClient();
    return await lxLyClient.init({
        log: true,
        network: network,
        providers: {
            0: {
                provider: "https://eth-sepolia.g.alchemy.com/v2/Bh1ANap4EQrTxY5-g3y5uJgKwjIsctJ-",
                configuration: {
                    bridgeAddress: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
                    wrapperAddress: "0x0f04f8434bac2e1db8fca8a34d3e177b6c7ccaba",
                    bridgeExtensionAddress: "0x2311BFA86Ae27FC10E1ad3f805A2F9d22Fc8a6a1",
                    isEIP1559Supported: true
                },
                defaultConfig: {
                    from: userAddress
                }
            },
            29: {
                provider: "https://rpc.tatara.katanarpc.com/",
                configuration: {
                    bridgeAddress: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
                    bridgeExtensionAddress: "0x2311BFA86Ae27FC10E1ad3f805A2F9d22Fc8a6a1",
                    isEIP1559Supported: false
                },
                defaultConfig: {
                    from: userAddress
                }
            }
        }
    });
}

module.exports = {
    getLxLyClient: getLxLyClient,
}