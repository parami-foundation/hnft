import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { EIP5489ForInfluenceMiningContractAddress } from '../models/hnft';
import EIP5489ForInfluenceMining from '../contracts/EIP5489ForInfluenceMining.json';

export const useUpgradeBillboard = (tokenId?: string, level?: number | string) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: EIP5489ForInfluenceMiningContractAddress,
    abi: EIP5489ForInfluenceMining.abi,
    functionName: 'upgradeTo',
    args: [tokenId, level],
  });

  const {
    data,
    isLoading: writeLoading,
    write: upgradeHnft,
    isError,
    error,
  } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess: upgradeSuccess } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  return {
    upgradeHnft,
    isLoading: writeLoading || waitTxLoading,
    isSuccess: upgradeSuccess,
    isError,
    error: error,
    prepareError,
  };
};
