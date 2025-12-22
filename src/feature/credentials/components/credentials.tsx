"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  EmptyView,
  EntittyHeader,
  EntityContainer,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useCredentialsParams } from "@/feature/credentials/hooks/use-credentials-params";
import type { Credential } from "@/generated/prisma/client";
import { CredentialType } from "@/generated/prisma/enums";
import { useEntitySearch } from "@/hooks/use-entity-search";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialsItem data={credential} />}
      emptyView={<CredentialsEmptyView />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled: boolean }) => {
  return (
    <EntittyHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonLabel="New Credential"
      newButtonHref="/credentials/new"
      disabled={disabled}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  return (
    <EntityPagination
      disabled={credentials.isFetching}
      page={params.page}
      totalPages={credentials.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader disabled={false} />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoadingView = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsErrorView = () => {
  return <ErrorView message="Error loading credentials..." />;
};

export const CredentialsEmptyView = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };
  return (
    <EmptyView
      message="You haven't created any credentials yet. Get started by creating a new credential."
      onNew={handleCreate}
    />
  );
};

const credentialLogo: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg",
};

export const CredentialsItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  const logo = credentialLogo[data.type] || "/logos/openai.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
