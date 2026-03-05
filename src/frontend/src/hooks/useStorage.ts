import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useStorageClient() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (!actor) throw new Error("No actor available");

      const config = await loadConfig();
      const agentOptions = identity ? { identity } : {};
      const agent = await HttpAgent.create({
        ...agentOptions,
      });

      const storageClient = new StorageClient(
        "images",
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const { hash } = await storageClient.putFile(bytes, (pct) => {
          setUploadProgress(pct);
        });
        return hash;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [actor, identity],
  );

  const getImageUrl = useCallback(async (hash: string): Promise<string> => {
    if (!hash) return "";
    const config = await loadConfig();
    const agent = await HttpAgent.create({});
    const storageClient = new StorageClient(
      "images",
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    return storageClient.getDirectURL(hash);
  }, []);

  return { uploadFile, getImageUrl, uploadProgress, isUploading };
}
