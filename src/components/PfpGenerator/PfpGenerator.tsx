import { UploadFile, Form, UploadProps, Upload, Button, Image as AntdImage, notification, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Bit, BitArray, write } from '../../utils';

export interface PfpGeneratorProps {
    address: string;
    tokenId: number;
    imgUrl?: string;
}

const hexStartingIndex = 8;
const tokenIdStartingIndex = 224;

const typeMap = {
    'wnft': 1,
    'did': 2
}

export function PfpGenerator({ address, tokenId, imgUrl }: PfpGeneratorProps) {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [wpfpDataUrl, setWpfpDataUrl] = useState<string>();
    const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

    const generateRawData = (address: string, tokenId: number) => {
        const raw = new BitArray(256);

        // bitArray: [ 1 byte type identifier, 20 bytes contract address/did, 000...000, tokenId in 32bit ]
        const typeIdentifier: number = typeMap['wnft'];
        raw.set([...typeIdentifier.toString(2).padStart(8, '0')].map(bit => +bit as Bit), 0);

        const hexString = address.replace('0x', '');
        [...hexString].forEach((c, index) => {
            raw.set(
                [...parseInt(c, 16).toString(2).padStart(4, '0')].map(bit => +bit as Bit),
                hexStartingIndex + index * 4
            )
        });

        raw.set(
            [...(+tokenId).toString(2).padStart(32, '0')].map(bit => +bit as Bit),
            tokenIdStartingIndex
        );

        return raw;
    }

    const generateWpfp = (imageUrl: string) => {
        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (img.width !== img.height || img.width < 220) {
                notification.warn({
                    message: 'Image is not square or too small',
                    description: 'Please try again.'
                });
                return;
            }
            const ringImage = write(img, generateRawData(address, tokenId));
            setWpfpDataUrl(ringImage.toDataURL());
        }
    }

    const onFinish = (values: any) => {
        const { image } = values;
        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onload = () => {
            generateWpfp(reader.result as string);
        }
    }

    useEffect(() => {
        if (imgUrl) {
            generateWpfp(imgUrl);
        }
    }, [imgUrl]);

    const props: UploadProps = {
        onRemove: _file => {
            setFileList([]);
        },
        beforeUpload: file => {
            setFileList([file]);
            return false;
        },
        fileList,
    };
    return (
        <Row>
            <Col span={12}>
                {!wpfpDataUrl && (
                    <p>Please upload your pfp image to generate WNFT pfp.</p>
                )}
                {wpfpDataUrl && (<>
                    <AntdImage preview={false} src={wpfpDataUrl}></AntdImage>
                    <br></br><br></br>
                    <p>You could also <a href='javascript:void(0)' onClick={() => setShowUploadForm(true)}>use your own image</a> for WNFT PFP</p>
                </>
                )}
            </Col>
            <Col span={12}>
                {(showUploadForm || !wpfpDataUrl) && (
                    <Form
                        name="basic"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="image"
                            name="image"
                            rules={[
                                { required: true, message: 'Please upload your pfp' },
                                {
                                    validator(rule, value, callback) {
                                        if (value?.fileList?.length === 0) {
                                            callback('Please upload your pfp');
                                            return;
                                        }
                                        callback();
                                    }
                                }
                            ]}
                        >
                            <Upload {...props}>
                                <Button icon={<UploadOutlined />}>Select File</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
                            <Button type="primary" htmlType="submit">
                                Generate WNFT PFP
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Col>
        </Row>
    );
};
