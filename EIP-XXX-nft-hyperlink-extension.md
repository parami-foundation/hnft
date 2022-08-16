---
eip: XXXX
title: NFT hyperlink extension
description: hyperlink extension for ERC-721
author: IronMan_CH (@IronMan_CH)
discussions-to: https://ethereum-magicians.org/t/eip-XXX-NFT-hyperlink-extension/YYYY
status: Draft
type: Standards Track
category: ERC
created: 2022-08-16
requires: 165, 721
---

## Abstract
This ERC proposes a new type of account - name-owned account (NOA) that is controlled by the owner of the name besides existing externally-owned account (EOA) and contract account (CA). With the new account type, users will be able to transfer/receive tokens using the name-derived address directly instead of the address of the name owner. A NOA can be as a social identity with all states on-chain even under 3rd-party or self custody. It also simplifies porting the social identity from one custody to another.

## Motivation
A popular way to onboard Web2 users to the Web3 world is custody. However, current custody models have severe drawbacks. Considering the following widely adopted custody models:
1. The custodian uses one EOA/CA to hold the assets of all users. This is not compatible with on-chain social protocols since all user activities are off-chain.
2. One EOA per user. The social identity is not portable, which means there is no way for users to migrate their social identity across different custody platforms.
3. One CA (e.g. Gnosis Safe) per user. The one time deployment cost is super high and the user experience is not good.

To solve all these problems, this ERC proposes a new type of account - name-owned account (NOA).  Using NOA as social identity instead of EOA/CA brings huge benefits for users:
- **Easy Web2 user onboarding**. We are providing standard Web2 user experiences with human readable names and 3rd-party custody. Every user of a centralized platform can immediately have a NOA by using the username as the name of NOA custodied by the platform.
- **On-chain states**. All user states are on-chain even under custody so it’s 100% compatible with social protocols.
- **Portable Account**. A NOA can be easily ported to different custody platforms by changing the owner.
- **Flexible Account Management**. We can use one EOA/CA to control any number of NOAs.

## Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### Name-Owned Account
An NOA has
1. a name for social identity; and
2. an address derived from the name to receive tokens; and
3. owner(s) of the name that can transfer the token.

The name should be human-readable and can be easily recognized socially. An example is the username of a centralized platform such as FB, Twitter. The name-derived address (NDA) is a normal Ethereum address that should not collide with the existing addresses of EOA/CA. Since we cannot use NDA as msg.sender, the right to transfer the tokens of the NDA is controlled by the owner/owners of the name. The name to owner/owners mapping is managed by an on-chain name service, and the owner/owners are EOA/CA, which can be the addresses of 3-rd custodians (e.g. FB) or self-custodian. By changing the owner of the name to the EOA of the user (can be done by requesting the custodian), the NDA becomes self-custodian, and no one should be able to transfer the assets unless the approved by the self-custodian user. 


### Name Representation
A name is represented by a bytes array which is ABI encoded. It **MAY** contain metadata of the name such as the name service the name belongs to.  Examples of the name are "vitalik.eth", "vitalik@0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", or "qizhou.fb".

### Interface

#### IERC721Hyperlink
```
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721H {
    /**
     * @dev this event emits when the slot on `tokenId` is authorzized to `slotManagerAddr`
     */
    event SlotAuthorizationCreated(uint256 tokenId, address slotManagerAddr);

    /**
     * @dev this event emits when the authorization on slot `slotManagerAddr` of token `tokenId` is revoked.
     * So, the corresponding DApp can handle this to stop on-going incentives or rights
     */
    event SlotAuthorizationRevoked(uint256 tokenId, address slotManagerAddr);

    /**
     * @dev this event emits when the uri on slot `slotManagerAddr` of token `tokenId` has been updated to `uri`.
     */
    event SlotUriUpdated(uint256 tokenId, address slotManagerAddr, string uri);

    /**
     * @dev
     * Authorize a hyperlink slot on `tokenId` to address `slotManagerAddr`.
     * Indeed slot is an entry in a map whose key is address `slotManagerAddr`.
     * Only the address `slotManagerAddr` can manage the specific slot.
     * This method will emit SlotAuthorizationCreated event
     */
    function authorizeSlotTo(uint256 tokenId, address slotManagerAddr) external;

    /**
     * @dev
     * Revoke the authorization of the slot indicated by `slotManagerAddr` on token `tokenId`
     * This method will emit SlotAuthorizationRevoked event
     */
    function revokeAuthorization(uint256 tokenId, address slotManagerAddr) external;

    /**
     * @dev
     * Revoke all authorizations of slot on token `tokenId`
     * This method will emit SlotAuthorizationRevoked event for each slot
     */
    function revokeAllAuthorizations(uint256 tokenId) external;

    /**
     * @dev
     * Set uri for a slot on a token, which is indicated by `tokenId` and `slotManagerAddr`
     * Only the address with authorization through {authorizeSlotTo} can manipulate this slot.
     * This method will emit SlotUriUpdated event
     */
    function setSlotUri(
        uint256 tokenId,
        string calldata newUri
    ) external;

    /**
     * @dev
     * returns the latest uri of an slot on a token, which is indicated by `tokenId`, `slotManagerAddr`
     */
    function getSlotUri(uint256 tokenId, address slotManagerAddr)
        external
        view
        returns (string memory);
}
```

### Authentication
The transfer and approve function is authenticated if and only if the message sender is the owner of the name.

## Rationale
We use bytes array to represent a name to ensure it’s flexible enough to deal with different use cases. E.g. one can encode the name service contract address the name belongs to into the bytes array. One can also encode extra authentication data, such as zero knowledge proofs, into the bytes array. In the future, we may propose a standard to formalize the name for wider adoption.

The isNameOwner function is sufficient for authenticating the message sender. One can verify the owner by looking up the name owner from a name service, or check zero knowledge proofs encoded in name to prove the ownership directly without looking up anything.

The addressOfName interface decouples the implementation from specific hashing algorithms, as long as the generated address doesn’t collide with EOA/CA address space.

## Backwards Compatibility
The new account type is compatible with existing ERC token standards.

## Reference Implementation
### Name Format
The decoded format of bytes name is not defined at this standard. One straightforward implementation would be:
```
bytes memory name = abi.encode((string, ‘address’), (username, nameService))
```
where the username is the string representation of the username and nameService is the name service contract address. This will decouple the implementation from specific name services such as ENS.

### Name Derived Address (INameOwnedAccount.addressOfName())
With the bytes format mentioned above, we can follow the similar rule of CREATE2 opcode to compute the NOA address from nameService and hash of the username as `address(keccak256(0xff, keccak256(“eip-4972.addressOfName”), nameService, keccak256(username)))`.  This can ensure it won’t collide with existing smart contract account addresses.

### Ownership of a Name (INameOwnedAccount.isNameOwner())
Normally we can get the owner from the name service and compare it with the message sender. We recommend the name service to define an owner function in the same format as ENS.

## Security Considerations
No security considerations were found.
## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
