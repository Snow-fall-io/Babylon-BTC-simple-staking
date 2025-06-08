import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { Container } from "@/app/components/Container/Container";
import { useAppState } from "@/app/state";
import { SmallLogo } from "../Logo/SmallLogo";
import { Connect } from "../Wallet/Connect";

// Remplace Image de next/image par <img>
import snowfallLogo from "@/app/assets/SnowFall-logo-w.png";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();

  return (
    <header className="bg-primary-main h-[18.75rem]">
      <Container className="h-20 flex items-center justify-between">
        {/* Logos alignés proprement */}
        <div className="flex items-center gap-2">
          <img
            src={snowfallLogo}
            alt="Snow Fall"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-semibold text-gray-200 dark:text-gray-400">
            x
          </span>
          <SmallLogo />
        </div>

        <div className="flex items-center gap-4">
          <Connect loading={loading} onConnect={open} />
        </div>
      </Container>
    </header>
  );
};
