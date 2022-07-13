import { UploadFile, Form, UploadProps, Upload, Button, Image as AntdImage, notification } from 'antd';
import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Bit, BitArray, write } from '../../utils';

export interface PfpGeneratorProps {
    address: string;
    tokenId: number;
}

const hexStartingIndex = 8;
const tokenIdStartingIndex = 224;

const typeMap = {
    'wnft': 1,
    'did': 2
}

export function PfpGenerator({ address, tokenId }: PfpGeneratorProps) {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [wpfpDataUrl, setWpfpDataUrl] = useState<string>();

    const onFinish = (values: any) => {
        const { image } = values;

        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onload = async () => {
            const img = new Image();
            img.src = reader.result as string;

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

            img.onload = () => {
                if (img.width !== img.height || img.width < 220) {
                    notification.warn({
                        message: 'Image is not square or too small',
                        description: 'Please try again.'
                    });
                }
                const ringImage = write(img, raw);
                setWpfpDataUrl(ringImage.toDataURL());
            }
        }
    }

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
        <div>

            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
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

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Generate WNFT PFP
                    </Button>
                </Form.Item>
            </Form>

            {wpfpDataUrl && (
                <AntdImage preview={false} src={wpfpDataUrl}></AntdImage>
            )}

        </div>
    );
};
