import { message } from "antd";
import { collectionsApi } from "../services/collectionsService.ts";
import type { MockImageCollection } from "../data/mockImageCollections.ts";

export async function saveEditedCollectionChanges({
  originalCollection,
  updatedCollection,
  stagedMoves,
  entityLabel,
}: {
  originalCollection: MockImageCollection;
  updatedCollection: MockImageCollection;
  stagedMoves: Record<string, { id: string; title: string; imageUrl: string }[]>;
  entityLabel: string;
}) {
  const sourceCollectionId = originalCollection.id;

  const originalPostIds = new Set(
    originalCollection.posts.map((post) => post.id)
  );

  const updatedPostIds = new Set(
    updatedCollection.posts.map((post) => post.id)
  );

  const removedPostIds = [...originalPostIds].filter(
    (postId) => !updatedPostIds.has(postId)
  );

  const addedPostIds = [...updatedPostIds].filter(
    (postId) => !originalPostIds.has(postId)
  );

  const nextTitle = updatedCollection.title.trim();
  const previousTitle = originalCollection.title.trim();

  if (nextTitle && nextTitle !== previousTitle) {
    await collectionsApi.updateCollectionTitle(sourceCollectionId, nextTitle);
  }

  for (const postId of addedPostIds) {
    await collectionsApi.addPostToCollection(sourceCollectionId, postId);
  }

  for (const postId of removedPostIds) {
    await collectionsApi.removePostFromCollection(sourceCollectionId, postId);
  }

  for (const [targetCollectionId, items] of Object.entries(stagedMoves)) {
    for (const item of items) {
      await collectionsApi.addPostToCollection(targetCollectionId, item.id);
      await collectionsApi.removePostFromCollection(sourceCollectionId, item.id);
    }
  }

  message.success(`Cambios de ${entityLabel} guardados correctamente.`);
}