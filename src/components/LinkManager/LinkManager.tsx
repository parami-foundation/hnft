import React from 'react';
import { Button, Form, Input, notification, Spin } from 'antd';
import './LinkManager.scss';
import { useState } from 'react';
import { ethers } from 'ethers';
import { LinkPrefixSelect } from '../LinkPrefixSelect';
import { LinkPrefixType } from '../../models/wnft';
import { useEffect } from 'react';
import { useMetaMask } from 'metamask-react';
import { ParamiLinkContractAddress_Mainnet, ParamiLinkContractAddress_Rinkeby } from '../../models/contract';
import ParamiLinkContractAbi from '../../ParamiLinkMock.json';

export interface LinkManagerProps {
    tokenId: number;
    contract: ethers.Contract;
}

export function LinkManager({ tokenId, contract }: LinkManagerProps) {

    const [linkPrefix, setLinkPrefix] = useState<LinkPrefixType>('https://');
    const [currentLink, setCurrentLink] = useState<string>();
    const [loading, setLoading] = useState<boolean>();
    const { ethereum, chainId } = useMetaMask();
    const [paramiLinkContract, setParamiLinkContract] = useState<ethers.Contract>();

    useEffect(() => {
        if (ethereum && chainId) {
            const chainIdNum = parseInt(chainId, 16);
            setParamiLinkContract(new ethers.Contract(
                chainIdNum === 1 ? ParamiLinkContractAddress_Mainnet : ParamiLinkContractAddress_Rinkeby,
                ParamiLinkContractAbi.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [ethereum, chainId]);

    const updateCurrentLink = async () => {
        if (paramiLinkContract) {
            try {
                const link = (await contract.getValue(tokenId, paramiLinkContract?.address)).toString();
                if (link) {
                    setCurrentLink(link);
                    return;
                }
                const contractOwnerResp = await contract.owner();
                const ownerTokenIdResp = await contract.tokenOfOwnerByIndex(contractOwnerResp.toString(), 0);
                const ownerLink = (await contract.getValue(ownerTokenIdResp.toString(), paramiLinkContract?.address)).toString();
                setCurrentLink(ownerLink || 'https://app.parami.io')
            } catch (e) {
                setCurrentLink('https://app.parami.io');
                console.error('Get Current Link Error', JSON.stringify(e));
            }
        }
    }

    const onFinish = async (value: any) => {
        if (paramiLinkContract) {
            setLoading(true);

            const { link } = value;

            try {
                const setLinkResp = await paramiLinkContract.setWNFTLink(contract.address, +tokenId, `${linkPrefix}${link}`);
                await setLinkResp.wait();
                notification.success({
                    message: 'Set Link Success'
                });
                updateCurrentLink();
                setLoading(false);
            } catch (e) {
                notification.error({
                    message: 'Set Link Failed',
                    description: JSON.stringify(e)
                });
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        updateCurrentLink();
    }, [paramiLinkContract]);

    return (
        <div className='link-manager'>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={onFinish}
                autoComplete="off"
            >

                <Form.Item
                    label="Current link"
                    name="currentLink"
                >
                    {currentLink && <a href={currentLink} target="_blank">{currentLink}</a>}
                    {!currentLink && <Spin></Spin>}
                </Form.Item>

                <Form.Item
                    label="Link"
                    name="link"
                    rules={[{ required: true, message: 'Please input link' }]}
                >
                    <Input addonBefore={<LinkPrefixSelect onChange={(prefix: LinkPrefixType) => setLinkPrefix(prefix)} />} />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>

        </div>
    );
};
