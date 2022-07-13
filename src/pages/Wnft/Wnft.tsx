import { useMetaMask } from 'metamask-react';
import React, { useState } from 'react';
import { Button, Form, Input, Card, Radio, Divider, Tooltip, Collapse, Image } from 'antd';
import './Wnft.scss';
import { CreateWnftModal } from '../../components/CreateWnftModal';
import { ContractType, NftInfo, WnftData } from '../../models/wnft';
import { WnftCard } from '../../components/WnftCard';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SupportedNetworkName } from '../../models/contract';

export interface WnftProps { }

export function Wnft({ }: WnftProps) {
    const [nftInfo, setNftInfo] = useState<NftInfo>();
    const [contractType, setContractType] = useState<ContractType>('NFT');
    const [wnftList, setWnftList] = useState<WnftData[]>([]);
    const [osUrl, setOsUrl] = useState<string>();
    const [form] = Form.useForm();

    const { status, ethereum, chainId } = useMetaMask();
    const chainName = SupportedNetworkName[parseInt(chainId as string, 16)];

    const onFinish = (values: any) => {
        setNftInfo({
            contractType: values.contractType,
            contractAddress: values.address,
            tokenId: +values.tokenId
        })
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onAddWnftData = (wnft: WnftData) => {
        if (!wnftList.find(item => item.contractAddress === wnft.contractAddress && item.tokenId === wnft.tokenId)) {
            setWnftList([...wnftList, wnft]);
        }
    }

    const onRemoveWnftData = (address: string, tokenId: number) => {
        const list = [...wnftList].filter(wnft => wnft.contractAddress !== address || wnft.tokenId !== tokenId);
        setWnftList(list);
    }

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

            detectContractType(address);
        }
    }, [osUrl, form, ethereum]);

    const detectContractType = (address: string) => {
        const options = { method: 'GET' };

        fetch(`https://testnets-api.opensea.io/api/v1/asset_contract/${address}`, options)
            .then(response => response.json())
            .then(response => {
                form.setFieldsValue({
                    contractType: response?.name?.startsWith('Wrapped') ? 'WNFT': 'NFT',
                });
            })
            .catch(err => console.error(err));
    }

    const contractTypeOptions = [
        { label: 'NFT', value: 'NFT' },
        { label: 'WNFT', value: 'WNFT' },
    ];

    return (<div className='wnft'>
        <Card bordered={false} title="WNFT Creator">
            <p>Connect wallet and start creating/managing your WNFTs!</p>
            <Divider />
            <Form
                form={form}
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
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
                    <Input onChange={e => setOsUrl(e.target.value)} placeholder={`https://opensea.io/assets/ethereum/0x098583c0cfba50212b421f525b4f7fe46901a0f2/106`}/>
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

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Tooltip title={`${status !== 'connected' ? 'Please connect wallet first.' : ''}`}>
                        <Button type="primary" htmlType="submit" disabled={status !== 'connected'}>
                            Submit
                        </Button>
                    </Tooltip>
                </Form.Item>
            </Form>
        </Card>

        {nftInfo && (
            <CreateWnftModal
                contractType={nftInfo.contractType}
                contractAddress={nftInfo.contractAddress}
                tokenId={nftInfo.tokenId}
                onCancel={() => setNftInfo(undefined)}
                onSubmit={onAddWnftData}
            ></CreateWnftModal>
        )}

        {wnftList.length > 0 && wnftList.map(wnftData => {
            return <WnftCard address={wnftData.contractAddress}
                onRemove={() => onRemoveWnftData(wnftData.contractAddress, wnftData.tokenId)}
                tokenId={wnftData.tokenId} contract={wnftData.contract}></WnftCard>
        })}

        <Card bordered={false} style={{ marginTop: '20px' }} title="Parami Extension Download">
            <Link to="/files/parami-extension.zip" target="_blank" download>Click to download Parami Extension</Link>
        </Card>
    </div>);
};

