import { Button, Form, Input, Modal, notification } from 'antd';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';
import { ParamiLinkContractAddress } from '../../models/contract';
import { LinkPrefixType } from '../../models/wnft';
import { LinkPrefixSelect } from '../LinkPrefixSelect';
import ParamiLink from '../../ParamiLink.json';

export interface ChangeLinkModalProps {
    onCancel: () => void,
    hContract: ethers.Contract,
    tokenId: number,
    linkChanged: () => void
}

export function ChangeLinkModal({ onCancel, hContract, tokenId, linkChanged }: ChangeLinkModalProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [linkPrefix, setLinkPrefix] = useState<LinkPrefixType>('https://');
    const [form] = Form.useForm();
    const { chainId, ethereum } = useCustomMetaMask();
    const [paramiLinkContract, setParamiLinkContract] = useState<ethers.Contract>();

    useEffect(() => {
        if ((chainId === 1 || chainId === 4) && ethereum) {
            setParamiLinkContract(new ethers.Contract(
                ParamiLinkContractAddress[chainId],
                ParamiLink.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [chainId, ethereum])

    const onUpdateLink = useCallback(async (value: { link: string }) => {
        if (paramiLinkContract) {
            setLoading(true);
            const { link } = value;

            try {
                notification.info({
                    message: 'Updating Link',
                    description: 'Please confirm in your wallet...'
                });

                const setLinkResp = await paramiLinkContract.setHNFTLink(hContract.address, tokenId, `${linkPrefix}${link}`);
                await setLinkResp.wait();

                notification.success({
                    message: 'Update Link Success'
                });
                linkChanged();
                setLoading(false);
            } catch (e) {
                notification.error({
                    message: 'Update Link Failed',
                    description: JSON.stringify(e)
                });
                setLoading(false);
            }
        }
    }, [hContract, tokenId, linkPrefix, paramiLinkContract])

    return (<>
        <Modal title='Update Link' centered visible onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                    Update
                </Button>
            ]}
        >
            <Form
                form={form}
                name="UpdateLinkForm"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                onFinish={onUpdateLink}
                autoComplete="off"
            >
                <Form.Item
                    label="Link"
                    name="link"
                    rules={[{ required: true, message: 'Please input link' }]}
                >
                    <Input addonBefore={<LinkPrefixSelect onChange={(prefix: LinkPrefixType) => setLinkPrefix(prefix)} />} />
                </Form.Item>
            </Form>
        </Modal>
    </>);;
};
