import { Select } from 'antd';
import React from 'react';
import { useEffect } from 'react';
import { LinkPrefixType } from '../../models/wnft';

const { Option } = Select;

export interface LinkPrefixSelectProps {
    onChange: (value: LinkPrefixType) => void
}

export function LinkPrefixSelect({ onChange }: LinkPrefixSelectProps) {
    useEffect(() => {
        onChange('https://');
    }, [])
    return <>
    <Select defaultValue="https://" className="select-before" onChange={onChange}>
            <Option value="https://">https://</Option>
            <Option value="ipfs://">ipfs://</Option>
            <Option value="wnft://">wnft://</Option>
            <Option value="did://">did://</Option>
        </Select>
    </>;
};
