import { Button, Form, Input, Modal, notification } from 'antd';
import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import { LinkPrefixType } from '../../models/wnft';
import { LinkPrefixSelect } from '../LinkPrefixSelect';

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

    const onUpdateLink = useCallback(async (value: {link: string}) => {
        if (hContract) {
            setLoading(true);
            const { link } = value;
            
            try {
                notification.info({
                    message: 'Updating Link',
                    description: 'Please confirm in your wallet...'
                });
                const setLinkResp = await hContract.setSlotUri(tokenId, `${linkPrefix}${link}`);
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
    }, [hContract, tokenId, linkPrefix])

    return (<>
        <Modal title='Update Link' centered visible onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                    Create
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
