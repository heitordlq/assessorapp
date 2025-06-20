import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string;
    carrier?: string;
  } | null;
}

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
    details: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setNetworkState({
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
      details: state.details,
    });
  };

  return {
    ...networkState,
    checkConnection,
  };
} 