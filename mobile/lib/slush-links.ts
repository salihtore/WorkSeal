import * as Linking from 'expo-linking';
import { WORKSEAL_WEB_URL } from '@/constants/config';

type ContractAction =
  | 'fund'
  | 'take'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'dispute'
  | 'message'
  | 'cancel';

type QueryValue = string | number | boolean | null | undefined;

const SLUSH_BROWSE_URL = 'https://my.slush.app/browse/';

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

export function buildWorkSealWebUrl(path = '/', query: Record<string, QueryValue> = {}) {
  const base = WORKSEAL_WEB_URL.replace(/\/+$/g, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set('source', 'mobile-slush');
  return url.toString();
}

export function buildSlushBrowseUrl(worksealUrl: string) {
  return `${SLUSH_BROWSE_URL}${encodeURIComponent(worksealUrl)}`;
}

export async function openWorkSealInSlush(path = '/', query: Record<string, QueryValue> = {}) {
  const worksealUrl = buildWorkSealWebUrl(path, query);
  await Linking.openURL(buildSlushBrowseUrl(worksealUrl));
}

export async function openContractActionInSlush(
  contractId: string,
  action: ContractAction,
  query: Record<string, QueryValue> = {}
) {
  const path = `/contracts/${trimSlashes(contractId)}`;
  await openWorkSealInSlush(path, { ...query, action });
}

export async function openNewContractInSlush() {
  await openWorkSealInSlush('/contracts/new');
}

export async function openConnectInSlush() {
  await openWorkSealInSlush('/connect');
}
