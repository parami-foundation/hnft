import React, { useState } from 'react';
import { Modal, Steps, notification, Result, Spin, Col, Row } from 'antd';
import { LoadingOutlined, SmileOutlined } from '@ant-design/icons';
import RegistryContractAbi from '../../ERC721WRegistry.json';
import WContractAbi from '../../ERC721WContract.json';
import ERC721MockAbi from '../../TestingERC721Contract.json';
import { ethers } from 'ethers';
import { useEffect } from 'react';
import { ParamiLinkContractAddress, RegistryContractAddress } from '../../models/contract';
import { NFT, WnftData } from '../../models/wnft';
import { useCustomMetaMask } from '../../hooks/useCustomMetaMask';

const { Step } = Steps;

export interface CreateWnftModalProps {
    nft: NFT;
    onCancel: () => void;
    onSubmit: (data: WnftData) => void;
}

export function CreateWnftModal({
    nft,
    onCancel,
    onSubmit
}: CreateWnftModalProps) {
    const contractAddress = nft.asset_contract.address;
    const tokenId = +nft.token_id;

    const [step, setStep] = useState<number>(0);
    const { ethereum, chainId } = useCustomMetaMask();
    const [registryContract, setRegistryContract] = useState<ethers.Contract>();
    const [wContractAddress, setWcontractAddress] = useState<string>();
    const [wContract, setWcontract] = useState<ethers.Contract>();
    const [nftContract, setNftContract] = useState<ethers.Contract>();
    const [createWcontractForm, setCreateWcontractForm] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(true);
    const [paramiLinkAddress, setParamiLinkAddress] = useState<string>();
    const [wrappingStep, setWrappingStep] = useState<number>(-1);
    const [creatingWContract, setCreatingWContract] = useState<boolean>(false);

    useEffect(() => {
        if (ethereum && contractAddress) {
            setNftContract(new ethers.Contract(
                contractAddress,
                ERC721MockAbi.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
        }
    }, [ethereum, contractAddress]);

    useEffect(() => {
        if (ethereum && chainId) {
            if (chainId !== 1 && chainId !== 4) {
                notification.error({
                    message: 'Chain Not Supported',
                    description: `ChainId: ${chainId}`
                })
                return;
            }
            setRegistryContract(new ethers.Contract(
                RegistryContractAddress[chainId],
                RegistryContractAbi.abi,
                new ethers.providers.Web3Provider(ethereum).getSigner()
            ));
            setParamiLinkAddress(ParamiLinkContractAddress[chainId]);
        }
    }, [ethereum, chainId]);

    const prepareWcontract = async (registry: ethers.Contract) => {
        try {
            const response = await registry.getERC721wAddressFor(contractAddress);
            setWcontractAddress(response.toString());
        } catch (e) {
            if ((e as any)?.reason === 'provided address is not wrapped') {
                setCreateWcontractForm(true);
                setLoading(false);
                return;
            }
            notification.error({
                message: 'Check WContract Error',
                description: JSON.stringify(e)
            })
        }
    }

    useEffect(() => {
        if (registryContract) {
            prepareWcontract(registryContract);
        }
    }, [registryContract]);

    const checkWnftToken = async () => {
        if (wContract) {
            try {
                await wContract.ownerOf(tokenId);
                setStep(2);
            } catch (e) {
                return;
            }
        }
    }

    useEffect(() => {
        if (wContract) {
            setStep(1);
            setLoading(false);
            checkWnftToken();
        }
    }, [wContract]);

    useEffect(() => {
        if (step === 2) {
            onSubmit({
                contractAddress: wContractAddress!,
                contract: wContract!,
                tokenId: tokenId
            });
        }
    }, [step])

    const createWcontract = async () => {
        if (registryContract) {
            try {
                setLoading(true);
                setCreatingWContract(true);
                notification.info({
                    message: 'Creating hNFT Contract...',
                    description: 'Please confirm in your wallet.'
                });
                const createResp = await registryContract.createERC721wContract(contractAddress);
                await createResp.wait();
                const wContractResp = await registryContract.getERC721wAddressFor(contractAddress);
                const wAddress = wContractResp.toString();
                setWcontractAddress(wAddress);
                setLoading(false);
                setCreatingWContract(false);
                notification.success({
                    message: 'Create hNFT Contract Success',
                    description: wAddress
                });
            } catch (e) {
                setLoading(false);
                setCreatingWContract(false);
                notification.error({
                    message: 'Create hNFT Contract Failed',
                    description: JSON.stringify(e)
                })
            }
        }
    }

    useEffect(() => {
        if (ethereum && wContractAddress) {
            try {
                setWcontract(new ethers.Contract(
                    wContractAddress,
                    WContractAbi.abi,
                    new ethers.providers.Web3Provider(ethereum).getSigner()
                ));
            } catch (e) {
                notification.error({
                    message: 'hNFT Contract Address Error',
                    description: JSON.stringify(e)
                });
            }
        }
    }, [ethereum, wContractAddress]);

    const approveAndWrap = async () => {
        if (nftContract && wContract) {
            try {
                setLoading(true);
                setWrappingStep(0);
                notification.info({
                    message: 'Approving NFT wrapping...',
                    description: 'Please confirm in your wallet.'
                });
                const approveResp = await nftContract.approve(wContractAddress, tokenId);
                await approveResp.wait();
                notification.info({
                    message: 'Wrapping NFT...',
                    description: 'Please confirm in your wallet.'
                });
                setWrappingStep(1);
                const wrapResp = await wContract.wrap(tokenId);
                await wrapResp.wait();
                notification.success({
                    message: 'Wrap NFT Success.'
                });
                setWrappingStep(2);
                setLoading(false);
                setStep(2);
            } catch (e) {
                setLoading(false);
                notification.error({
                    message: 'Approve and Wrap NFT Failed',
                    description: JSON.stringify(e)
                });
            }
        }
    }

    const handleNextStep = (currentStep: number) => {
        if (currentStep === 0) {
            createWcontract();
        } else if (currentStep === 1) {
            approveAndWrap();
        } else if (currentStep === 2) {
            onCancel();
        }
    }

    return (
        <Modal title="Wrap NFT" visible={true}
            onOk={() => handleNextStep(step)} onCancel={onCancel} confirmLoading={loading}
            width={1000} okText={`${step === 2 ? 'Done' : 'Next'}`}>
            <Steps current={step}>
                <Step title="hNFT Contract" description="Check contract status" icon={(step === 0 && creatingWContract) ? <LoadingOutlined /> : null} />
                <Step title="Wrap NFT" description="Check token status" icon={(step === 1 && wrappingStep >= 0) ? <LoadingOutlined /> : null} />
                <Step title="Done" description="All set!" icon={<SmileOutlined />} />
            </Steps>
            <div style={{ marginTop: '20px' }}>
                {step === 0 && !createWcontractForm && (
                    <div style={{ textAlign: 'center' }}>
                        <Spin></Spin>
                    </div>
                )}
                {step === 0 && createWcontractForm && (
                    <div>
                        <p>Let's Create a hNFT Contract for your NFT ({contractAddress})</p>
                        {creatingWContract && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div>
                                    <div style={{ textAlign: 'center' }}>
                                        <Spin size="small" />
                                    </div>
                                    <p>Creating hNFT Contract. Please wait for transaction confirmation.</p>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {step === 1 && (
                    <div>
                        <p>The hNFT Contract is ready at: {wContractAddress}</p>
                        <p>Let's approve and wrap your NFT!</p>
                        {wrappingStep >= 0 && (
                            <Row>
                                <Col span={8}>
                                    <Steps direction="vertical" size="small" current={wrappingStep}>
                                        <Step title="Approving for Wrapping" />
                                        <Step title="Wrapping NFT" />
                                        <Step title="Done" />
                                    </Steps>
                                </Col>
                                <Col span={16} style={{ display: 'flex', alignItems: 'center' }}>
                                    {wrappingStep !== 2 && (<div>
                                        <div style={{ textAlign: 'center' }}>
                                            <Spin size="small" />
                                        </div>
                                        <p>Wrapping in progress. Please wait for transaction confirmation.</p>
                                    </div>)}
                                </Col>
                            </Row>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <Result
                            status="success"
                            title="Successfully created hNFT. You can now close this modal and config your hNFT."
                            subTitle={`hNFT Contract Address: ${wContractAddress}. TokenId: ${tokenId}`}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};
