import { useNetwork } from "../contexts/NetworkContext";

export const OFFLINE_OPACITY = 0.4;

export function useOfflineDisabled() {
  const { isConnected } = useNetwork();
  return {
    disabled: !isConnected,
    style: isConnected ? {} : { opacity: OFFLINE_OPACITY },
  };
}
