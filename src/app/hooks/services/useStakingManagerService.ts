import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { EventEmitter } from "events";
import { useCallback, useRef } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useLogger } from "@/app/hooks/useLogger";
import { useAppState } from "@/app/state";

const stakingManagerEvents = {
  SIGNING: "signing",
} as const;

export const useStakingManagerService = () => {
  const { networkInfo } = useAppState();
  const { signBbnTx } = useBbnTransaction();
  const logger = useLogger();

  const { connected: cosmosConnected } = useCosmosWallet();
  const {
    network: btcNetwork,
    connected: btcConnected,
    signPsbt,
    signMessage,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const { current: eventEmitter } = useRef<EventEmitter>(new EventEmitter());

  const isLoading =
    !btcNetwork ||
    !cosmosConnected ||
    !btcConnected ||
    !signPsbt ||
    !signMessage ||
    !signBbnTx ||
    !versionedParams ||
    versionedParams.length === 0;

  const createBtcStakingManager = useCallback(() => {
    if (isLoading) {
      logger.info("createBtcStakingManager", {
        cosmosConnected,
        btcConnected,
        btcNetwork: Boolean(btcNetwork),
        signPsbt: Boolean(signPsbt),
        signMessage: Boolean(signMessage),
        signBbnTx: Boolean(signBbnTx),
        versionedParams: Boolean(versionedParams),
      });
      return null;
    }

    const btcProvider = {
      signPsbt: async (
        signingStep: SigningStep,
        psbt: string,
        options?: SignPsbtOptions,
      ) => {
        eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep, options);
        return signPsbt(psbt, options);
      },
      signMessage: async (
        signingStep: SigningStep,
        message: string,
        type: "ecdsa" | "bip322-simple",
      ) => {
        eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);
        return signMessage(message, type);
      },
    };

    const bbnProvider = {
      signTransaction: async <T extends object>(
        signingStep: SigningStep,
        msg: {
          typeUrl: string;
          value: T;
        },
      ) => {
        eventEmitter.emit(stakingManagerEvents.SIGNING, signingStep);
        return signBbnTx(msg);
      },
    };

    return new BabylonBtcStakingManager(
      btcNetwork,
      versionedParams,
      btcProvider,
      bbnProvider,
    );
  }, [
    isLoading,
    btcNetwork,
    versionedParams,
    cosmosConnected,
    btcConnected,
    signPsbt,
    signMessage,
    signBbnTx,
    eventEmitter,
    logger,
  ]);

  const on = useCallback(
    (callback: (step: SigningStep, options?: SignPsbtOptions) => void) => {
      eventEmitter.on(stakingManagerEvents.SIGNING, callback);
    },
    [eventEmitter],
  );

  const off = useCallback(
    (callback: (step: SigningStep, options?: SignPsbtOptions) => void) => {
      eventEmitter.off(stakingManagerEvents.SIGNING, callback);
    },
    [eventEmitter],
  );

  return {
    isLoading,
    createBtcStakingManager,
    on,
    off,
  };
};
