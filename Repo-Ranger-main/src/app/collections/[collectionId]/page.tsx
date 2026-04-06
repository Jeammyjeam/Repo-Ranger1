import { redirect } from 'next/navigation';

export default function ObsoleteCollectionPage() {
  // The detailed "Collections" view was removed in favor of a simpler "Saved Repos" list.
  // If a user tries to visit an old URL for a specific collection,
  // we redirect them to the search page.
  redirect('/search');
}
