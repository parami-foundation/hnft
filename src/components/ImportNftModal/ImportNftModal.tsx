import { Form, Modal, Image, Input, Collapse, Radio, Tooltip, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useOpenseaApi } from '../../hooks/useOpenseaApi';
import { ContractType } from '../../models/wnft';

export interface ImportNftModalProps {
    onCancel: () => void
}

export function ImportNftModal({ onCancel }: ImportNftModalProps) {
    const [form] = Form.useForm();
    const [osUrl, setOsUrl] = useState<string>();
    const [contractType, setContractType] = useState<ContractType>('NFT');
    const { retrieveContract } = useOpenseaApi();

    const contractTypeOptions = [
        { label: 'NFT', value: 'NFT' },
        { label: 'WNFT', value: 'WNFT' },
    ];

    const onOk = () => {
        form.submit();
    };

    useEffect(() => {
        // osUrl be like: https://opensea.io/assets/ethereum/0x098583c0cfba50212b421f525b4f7fe46901a0f2/106
        // https://testnets.opensea.io/assets/rinkeby/0x7bd223a98f9bf0c7862fbcee3622af49a1bf70a5/373
        if (osUrl?.startsWith('https://opensea.io/assets/ethereum') || osUrl?.startsWith('https://testnets.opensea.io/assets/rinkeby')) {
            const parts = osUrl.split('/').filter(Boolean);

            const address = parts[parts.length - 2];

            form.setFieldsValue({
                address,
                tokenId: parts[parts.length - 1]
            });

            retrieveContract(address).then(resp => {
                form.setFieldsValue({
                    contractType: resp?.name?.startsWith('Wrapped') ? 'WNFT' : 'NFT',
                });
            });
        }
    }, [osUrl, form]);

    return (
        <Modal title="Add WNFT" visible={true} onOk={onOk} onCancel={onCancel} width={600}>
            <Form
                form={form}
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                autoComplete="off"
            >
                <Form.Item
                    label={`Opensea NFT link`}
                    name="osUrl"
                    tooltip={<Image
                        width={220}
                        src={require('../../assets/osLinkTooltip.jpeg')}
                    />}
                >
                    <Input onChange={e => setOsUrl(e.target.value)} placeholder={`https://opensea.io/assets/ethereum/0x098583c0cfba50212b421f525b4f7fe46901a0f2/106`} />
                </Form.Item>

                <Collapse style={{ marginBottom: '24px' }} ghost className='advanced-settings'>
                    <Collapse.Panel header="advanced settings" key="1" forceRender>
                        <Form.Item
                            label="Contract Type"
                            name="contractType"
                            rules={[{ required: true, message: 'Please select contract type' }]}
                        >
                            <Radio.Group size="large" options={contractTypeOptions} onChange={type => setContractType(type.target.value)} value={contractType} optionType="button" />
                        </Form.Item>

                        <Form.Item
                            label={`${contractType} Contract Address`}
                            name="address"
                            rules={[
                                { required: true, message: `Please input the ${contractType} contract address` },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="tokenId"
                            name="tokenId"
                            rules={[{ required: true, message: 'Please input your tokenId' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Collapse.Panel>
                </Collapse>
            </Form>
        </Modal>
    );
};
