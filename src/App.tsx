import { useState } from 'react';
import './App.css';
import { Bit, BitArray, bs58ToHex, parse, write } from './utils';

function App() {
  const [address, setAddress] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [did, setDid] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const typeMap = {
    'wnft': 1,
    'did': 2
  }
  const hexStartingIndex = 8;
  const tokenIdStartingIndex = 224;

  const decode_wnft = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const reader = new FileReader();
      reader.readAsDataURL((e.target as any).files[0]);
      reader.onload = async () => {
        const img = new Image();
        img.src = reader.result as string;
        setTimeout(() => {
          const data = parse(img);

          const bitString = data.toString();
          const typeIdentifierBits = bitString.slice(0, 8)
          const typeId = parseInt(typeIdentifierBits, 2);
          const type = Object.keys(typeMap).find(type => typeMap[type] === typeId);

          const hexBits = bitString.slice(8, 168);
          let address = '0x';
          for (let i = 0; i < 40; i++) {
            const startIndex = i * 4;
            address += parseInt(hexBits.slice(startIndex, startIndex + 4), 2).toString(16);
          }
          console.log(`${type === 'wnft' ? 'contract address' : 'did'} decoded: `, address);

          if (type === 'wnft') {
            const decodedTokenId = parseInt(bitString.slice(224), 2);
            console.log('decoded token id: ', decodedTokenId);
          }
        }, 100)
      };
    };
    input.click();
  };

  const encode_wnft = (type) => {
    
    if (type === 'wnft' && (address === '' || tokenId === '')) {
      setErrorMsg('请输入合约地址和 tokenId');
      return;
    }
    if (type === 'did' && did === '') {
      setErrorMsg('请输入 did')
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const reader = new FileReader();
      reader.readAsDataURL((e.target as any).files[0]);

      reader.onload = async () => {
        const img = new Image();
        img.src = reader.result as string;

        const raw = new BitArray(256);

        // bitArray: [ 1 byte type identifier, 20 bytes contract address/did, 000...000, tokenId in 32bit ]
        const typeIdentifier: number = typeMap[type];
        raw.set([...typeIdentifier.toString(2).padStart(8, '0')].map(bit => +bit as Bit), 0);
        
        const didBs58 = did.startsWith('did:ad3:') ? did.slice(8) : did;
        const didHex = bs58ToHex(didBs58);

        const hexString = type === 'wnft' ? address.replace('0x', '') : didHex;
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

        setTimeout(() => {
          const ringImage = write(img, raw);
          document.body.appendChild(ringImage);
          console.log('raw', raw.toString());
        }, 300)
      };
    };

    input.click();
  }

  
  return (
    <div className="App">
      <h2>wNFT 生成工具 ｜ wNFT ring tool</h2>
      <div className="encoder">
        Wrap 合约地址: <input id="contractAddressInput" style={{width: '400px'}} onChange={(e) => setAddress(e.target.value)} />
        <br/><br/>
        token id: <input id="tokenIdInput" onChange={(e) => setTokenId(e.target.value)} />
        <br/><br/>
        <button onClick={() => encode_wnft('wnft')}>用合约地址和 tokenId 生成 wnft 头像</button>
      </div>
      <div className="encoder">
        did: <input id="didInput" onChange={(e) => setDid(e.target.value)} style={{width: '400px'}} />
        <br/><br/>
        <button onClick={() => encode_wnft('did')}>用 did 生成 wnft 头像</button>
      </div>
      <button onClick={() => decode_wnft()}>decode wnft (测试用)</button>
      <br/><br/>
      <p id="logger">
        {errorMsg}
      </p>
    </div>
  );
}

export default App;
