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

This ERC proposes a new extension of NFT(non-fungible token, aka ERC-721) - nft-hyperlink-extension which tries to add hyperlinks to NFTs. With this extension, owners of NFTs can authorize a uri slot to a specific address which can be an externally-owned account (EOA) or a contract account, and they can revoke that authorization as well.

## Motivation
As NFT grows as the most impressive innovation these days, NFTs win more and more attensions, and have more opportunity to exhibit in front of users. When go through all the EIPs relative to NFT, only find limited profitable fashions, such as transfer, rent. There exist a gap between NFT's influence and profitable fashions.

Hyperlink once brought exponential growth to WEB1.0 when html won enough attension. Maybe it's an oppotunity to bring hyperlink extension to NFTs.

The hyperlink extension, tries to make it possible to exersise the `fructus` right, at the same time keeps the `abusus`. With hyperlink extension, NFTs' owners can earn profit by authorize a hyperlink slot to an address.

//TODO: add more explaination on `frustus` and `abusus`.

## Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### NFT hyperlink extension

NFT hyperlink extension extends ERC-721 with a `mapping<TokenId, mapping<SlotManagerAddress, uri>>`. The mapping means `TokenId` identified NFT has authorized `SlotManagerAddress` to manage the `uri` which is identified by `SlotManagerAddress`.

Besides, extension also provide the supporting facilities, such as
1. authorizeSlot/revokeSlot call pair used to manage slot authorization, and SlotAuthorizationCreate/Revoked event pair used to announce authorization management happens.
2. setSlotUri/getSlotUri call pair used to manage/view uri on slot, and SlotUriUpdated used to announce uri management happens.

### New URI format

This extension tries to add a new URI format, which is prefixed with "hnft://". This URI format enables redirect or connect activity between hNFTs, it enables great imagination.


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
The authorizeSlotTo, revokeAuthorization and revokeAllAuthorizations function is authenticated if and only if the message sender is the owner of the token.

## Rationale
We use URI to represent value of slot to ensure it's flexible enough to deal with different use cases. E.g. one can define a custom uri format to indicate a brand new protocol.

We use Address to represent key of slot to ensure it's flexible enough to deal with different use cases. E.g. one can manage slot's URI with an EOA, or manage slot's URI with a contract in which can do more detailed limitation or agreement.

## Backwards Compatibility
The NFT hyperlink extension is compatible with existing ERC token standards.

## Reference Implementation
You can find an implementation of this standard in ../assets/eip-XXX.

## Security Considerations
No security considerations were found.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
