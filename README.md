# NailongFi
NailongFi make your idle assets fat

What is it?
Auto-Yield is a cross-chain vault zapper that lets users instantly deposit idle assets from any EVM wallet into high-yield vaults on Katana — with just one tap. Built with Agglayer, Katana’s DeFi primitives, and Privy for seamless onboarding, Auto-Yield abstracts away the complexity of bridging, zapping, and managing DeFi yield.

✨ What Problem Does It Solve?

DeFi is powerful — but far too fragmented and complex for everyday users.
Users often have idle USDC or other tokens sitting across various chains and don’t know:

-Where to find reliable yield opportunities
-How to bridge or zap across chains
-How to evaluate DeFi vault strategies

Manual DeFi usage requires 5+ steps just to get yield. As a result, billions of dollars sit idle in wallets earning 0%. Most wallets don’t help with this.

🔧 How It Works

1.User connects their wallet via Privy (social login or EOA)

2. We scan for idle assets across supported chains

3. The user sets preferences: % of idle funds to auto-zap

4.When user taps “ZAPS”: We use Agglayer to bridge the tokens to Katana

5. We deposit them into Katana’s deployed vaults (e.g. Yearn, Sushi)

6. Position is tracked in the dashboard

7. The user can withdraw at any time, routed back via Agglayer.