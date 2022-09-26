import React, { useEffect, useState } from 'react';
import { hexStartingIndex, HNFT_IDENTIFIER, tokenIdStartingIndex } from '../../models/wnft';
import { Bit, BitArray, write } from '../../utils';
import { Image as AntdImage, Badge, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface RingPFPProps {
    address: string;
    tokenId: number;
    imgUrl: string;
    fallbackImageUrl: string;
    setImageDataUrl: (dataUrl: string) => void;
}

export function RingPFP({ address, tokenId, imgUrl, fallbackImageUrl, setImageDataUrl }: RingPFPProps) {
    const [ringPfpUrl, setRingPfpUrl] = useState<string>();
    const [generateWpfpError, setGenerateWpfpError] = useState<string>('');

    const generateRawData = (address: string, tokenId: number) => {
        const raw = new BitArray(256);

        // bitArray: [ 1 byte type identifier, 20 bytes contract address/did, 000...000, tokenId in 32bit ]
        raw.set([...HNFT_IDENTIFIER.toString(2).padStart(8, '0')].map(bit => +bit as Bit), 0);

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
            if (img.width < 220) {
                setGenerateWpfpError('Image size is too small.');
                return;
            }
            if (img.width !== img.height) {
                setGenerateWpfpError('Image is not square.');
                return;
            }
            const ringImage = write(img, generateRawData(address, tokenId));
            const imageDataUrl = ringImage.toDataURL();
            setImageDataUrl(imageDataUrl);
            setRingPfpUrl(imageDataUrl);
            setGenerateWpfpError('');
        }
    }

    useEffect(() => {
        generateWpfp(imgUrl);
    }, [imgUrl])

    return <>
        <Badge count={generateWpfpError.length > 0
            ? <Tooltip title={`${generateWpfpError} Please try uploading a different one.`}>
                <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: '1.5rem', top: '20px', right: '20px' }} />
            </Tooltip>
            : ''}
            >
            <AntdImage className='ring-pfp' style={{ width: '100%' }} src={ringPfpUrl || fallbackImageUrl} preview={false} />
        </Badge>
    </>;
};
