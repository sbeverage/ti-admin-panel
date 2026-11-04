/**
 * How many things are waiting to be reviewed, split by queue.
 *
 * Shared by the sidebar badge and the Pending Approvals tabs so the two can
 * never disagree. The tabs used to derive their counts from the rows already
 * on screen, and the page only ever fetches the active tab's queue, so the
 * other tab always read (0) until it was clicked. Counting has to be
 * independent of what is being displayed.
 *
 * The three queues are deliberately separate numbers. Vendors and charities
 * are the two approval tabs; access requests are a different question
 * entirely ("should this person be able to edit that charity?") and live in
 * their own card, but all three are things an admin still has to deal with,
 * so the badge adds them up.
 */
import { useCallback, useEffect, useState } from 'react';
import { approvalsAPI, charityAccessAPI } from '../services/api';

export interface PendingCounts {
  vendors: number;
  charities: number;
  access: number;
  total: number;
}

const CHANGED_EVENT = 'thrive:approvals-changed';

/**
 * Tell every mounted counter to re-read. Call after approving, rejecting or
 * anything else that empties a queue, so the sidebar badge drops without
 * waiting for a navigation.
 */
export function notifyApprovalsChanged(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

const EMPTY: PendingCounts = { vendors: 0, charities: 0, access: 0, total: 0 };

export function usePendingApprovalsCount(): PendingCounts & { reload: () => void } {
  const [counts, setCounts] = useState<PendingCounts>(EMPTY);

  const reload = useCallback(async () => {
    try {
      // limit 1 because only pagination.total is wanted; the rows are thrown
      // away. This relies on the API counting the filtered set rather than
      // the page, which it does via count: "exact".
      const [vendorRes, charityRes, accessRes] = await Promise.all([
        approvalsAPI.getPendingApprovals(1, 1, 'vendor'),
        approvalsAPI.getPendingApprovals(1, 1, 'beneficiary'),
        charityAccessAPI.list('pending').catch(() => ({ data: [] as unknown[] })),
      ]);

      const vendors = vendorRes?.pagination?.total ?? 0;
      const charities = charityRes?.pagination?.total ?? 0;
      const access = Array.isArray(accessRes?.data) ? accessRes.data.length : 0;

      setCounts({ vendors, charities, access, total: vendors + charities + access });
    } catch {
      // A counter that throws should not take a page down with it. Leaving
      // the previous numbers up is better than showing a wrong zero, which
      // reads as "nothing to do".
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener(CHANGED_EVENT, handler);
    return () => window.removeEventListener(CHANGED_EVENT, handler);
  }, [reload]);

  return { ...counts, reload };
}
