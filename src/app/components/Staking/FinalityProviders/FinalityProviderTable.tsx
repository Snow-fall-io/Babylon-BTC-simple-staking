/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import { Loader, Table, useWatch } from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { useMemo, useState } from "react";

import warningOctagon from "@/app/assets/warning-octagon.svg";
import warningTriangle from "@/app/assets/warning-triangle.svg";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { FinalityProviderState as FinalityProviderStateEnum } from "@/app/types/finalityProviders";

import { finalityProviderColumns } from "./FinalityProviderColumns";
import { StatusView } from "./FinalityProviderTableStatusView";

interface FinalityProviderTable {
  onSelectRow?: (fpPK: string) => void;
}

export const FinalityProviderTable = ({ onSelectRow }: FinalityProviderTable) => {
  const {
    isFetching,
    finalityProviders,
    allFinalityProviders,
    hasNextPage,
    hasError,
    fetchNextPage,
    isRowSelectable,
    filter,
  } = useFinalityProviderState();

  const [showOthers, setShowOthers] = useState(false);
  const selectedFP = useWatch({ name: "finalityProvider", defaultValue: "" });

  const { snowFallProvider, otherProviders } = useMemo(() => {
    if (!allFinalityProviders) return { snowFallProvider: [], otherProviders: [] };

    const snowFall = allFinalityProviders.find(
      (fp) => fp.description?.moniker === "Snow Fall"
    );

    const others = allFinalityProviders.filter((fp) => {
      const isSnowFall = fp.description?.moniker === "Snow Fall";
      if (isSnowFall) return false;

      const isActive = fp.state === FinalityProviderStateEnum.ACTIVE;

      if (filter.status === "active") return isActive;
      if (filter.status === "inactive") return !isActive;
      return true;
    });

    return {
      snowFallProvider: snowFall ? [snowFall] : [],
      otherProviders: others,
    };
  }, [allFinalityProviders, filter.status]);

  const errorView = (
    <StatusView
      icon={<Image src={warningTriangle} alt="Warning" width={88} height={88} />}
      title="Failed to Load"
      description={
        <>
          The finality provider list failed to load. Please check <br />
          your internet connection or try again later.
        </>
      }
    />
  );

  const loadingView = (
    <StatusView
      icon={<Loader className="text-primary-light" />}
      title="Loading Finality Providers"
    />
  );

  const noMatchesView = (
    <StatusView
      icon={<Image src={warningOctagon} alt="Warning" width={160} height={160} />}
      title="No Matches Found"
    />
  );

  if (hasError) {
    return errorView;
  }

  if (isFetching && (!finalityProviders || finalityProviders.length === 0)) {
    return loadingView;
  }

  if (!isFetching && snowFallProvider.length === 0 && otherProviders.length === 0) {
    return noMatchesView;
  }

  return (
    <div className="space-y-4">
      {/* Snow Fall mis en avant */}
      <Table
        wrapperClassName="max-h-[20rem]"
        className="min-w-full"
        data={snowFallProvider}
        columns={finalityProviderColumns}
        loading={isFetching}
        hasMore={false}
        selectedRow={selectedFP}
        onRowSelect={(row) => {
          onSelectRow?.(row?.btcPk ?? "");
        }}
        isRowSelectable={isRowSelectable}
      />

      {/* Bouton "Show others" */}
      <div className="flex justify-center">
        <button
          className="px-4 py-2 text-sm rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition disabled:opacity-50"
          onClick={() => setShowOthers(!showOthers)}
          disabled={otherProviders.length === 0}
        >
          {showOthers ? "Hide Other Finality Providers" : "Show Other Finality Providers"}
        </button>
      </div>

      {/* Autres validateurs */}
      {showOthers && (
        <Table
          wrapperClassName="max-h-[28.5rem]"
          className="min-w-full"
          data={otherProviders}
          columns={finalityProviderColumns}
          loading={isFetching}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          selectedRow={selectedFP}
          onRowSelect={(row) => {
            onSelectRow?.(row?.btcPk ?? "");
          }}
          isRowSelectable={isRowSelectable}
        />
      )}

      {/* Fallback visuel si aucun autre FP */}
      {showOthers && otherProviders.length === 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 italic">
          No finality providers match the current filter.
        </div>
      )}
    </div>
  );
};
